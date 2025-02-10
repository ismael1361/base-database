import type { Server } from "./index";
import path from "path";
import fs from "fs";
import ts from "typescript";
import * as vm from "vm";
import JSON5 from "json5";
import { PathInfo } from "../Utils";
import * as colorette from "colorette";
import { default_scripts } from "./models/scripts";
import BasicEventEmitter from "basic-event-emitter";

const tsCompilerOptions: Record<string, ts.CompilerOptions> = {};

const getTSCompilerOptions = (filePath: string): ts.CompilerOptions => {
	const cachedPath = Object.keys(tsCompilerOptions).find((p) => PathInfo.get(p).isParentOf(filePath.replace(/\\/g, "/")) || PathInfo.get(p).equals(filePath.replace(/\\/g, "/")));

	if (cachedPath) {
		return tsCompilerOptions[cachedPath];
	}

	let options: ts.CompilerOptions = {};

	let tsconfigFile = filePath;

	while (fs.existsSync(path.resolve(tsconfigFile, "tsconfig.json")) !== true && path.dirname(tsconfigFile) !== path.dirname(process.cwd())) {
		tsconfigFile = path.dirname(tsconfigFile);
	}

	try {
		if (fs.existsSync(path.resolve(tsconfigFile, "tsconfig.json"))) {
			const tsconfig: ts.TranspileOptions = JSON5.parse(fs.readFileSync(path.resolve(tsconfigFile, "tsconfig.json"), "utf-8"));
			options = tsconfig.compilerOptions ?? {};
		}
	} catch (err) {}

	const rootDir = path.join(tsconfigFile, options.rootDir ?? "");

	const compilerOptions: ts.CompilerOptions = {
		listEmittedFiles: true,
		declaration: true,
		declarationMap: true,
		sourceMap: true,
		forceConsistentCasingInFileNames: true,
		allowJs: true,
		checkJs: false,
		allowSyntheticDefaultImports: true,
		noFallthroughCasesInSwitch: true,
		esModuleInterop: true,
		resolveJsonModule: true,
		strict: true,
		noImplicitAny: false,
		skipLibCheck: true,
		pretty: true,
		noEmitOnError: true,
		removeComments: false,
		...options,
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.CommonJS,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
		lib: [...(options.lib ?? []), "esnext", "ES2015"].map((lib) => `lib.${lib.toLowerCase()}.d.ts`),
		rootDir: typeof options.rootDir === "string" ? rootDir : undefined,
		outDir: typeof options.outDir === "string" ? path.join(tsconfigFile, options.outDir) : undefined,
		declarationDir: typeof options.declarationDir === "string" ? path.join(tsconfigFile, options.declarationDir) : undefined,
		noEmit: false,
	};

	compilerOptions.baseUrl = compilerOptions.baseUrl ?? compilerOptions.rootDir ?? tsconfigFile;

	if (fs.existsSync(path.resolve(tsconfigFile, "tsconfig.json"))) tsCompilerOptions[tsconfigFile.replace(/\\/g, "/")] = compilerOptions;

	return compilerOptions;
};

const validateTypeScript = (filePath: string, onError?: (error: string) => void): string => {
	// Ler o conteúdo do arquivo TypeScript
	const fileContent = fs.readFileSync(filePath, "utf-8");

	// Carregar as configurações do tsconfig.json (se existir)
	const compilerOptions = getTSCompilerOptions(filePath);

	// Criar o compilador TypeScript
	const program = ts.createProgram([filePath], { ...compilerOptions, outDir: path.resolve(process.cwd(), "dist") });

	// Verificar se há erros no código TypeScript
	const diagnostics = ts.getPreEmitDiagnostics(program);

	onError = typeof onError === "function" ? onError : console.error;

	if (diagnostics.length > 0) {
		// Exibir erros de validação
		diagnostics.forEach((diagnostic) => {
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
			const fileName = diagnostic.file?.fileName ?? filePath;

			if (diagnostic.file && diagnostic.start !== undefined) {
				const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
				const errorLine = fileContent.split("\n")[line].replace(/\t/g, " ");
				const errorLength = diagnostic.length || message.length; // Usa o comprimento do erro ou da mensagem
				onError(
					`\n${colorette.cyan(path.relative(process.cwd(), fileName))}:${colorette.yellow(line + 1)}:${colorette.yellow(character + 1)} - ${colorette.red("error")} ${colorette.blue(
						`TS${diagnostic.code}`,
					)}: ${message}\n\n${colorette.bgWhite(colorette.black(line + 1))} ${errorLine}\n${colorette.bgWhite(" ")} ${" ".repeat(character)}${colorette.red("~".repeat(errorLength))}\n`,
				);
			} else {
				onError(`\n${colorette.cyan(path.relative(process.cwd(), fileName))} - ${colorette.red("error")} ${colorette.blue(`TS${diagnostic.code}`)}: ${message}\n`);
			}
		});

		return "";
	}

	return fileContent;
};

const resolveModule = (specifier: string, actualPath: string, baseUrl?: string, paths?: ts.MapLike<string[]>): string => {
	const isExists = (p: string): string | undefined => {
		const paths: string[] = ["", ".js", ".ts", ".json", ".node", ".cjs", ".mjs", ".jsx", ".tsx", ".mts"]
			.map((ext) => p + ext)
			.concat(["index.js", "index.ts", "index.json", "index.node", "index.cjs", "index.mjs", "index.jsx", "index.tsx", "index.mts"].map((ext) => path.resolve(p, ext)));
		return paths.find((p) => fs.existsSync(p));
	};

	const resolvedPath = isExists(path.resolve(actualPath, specifier));
	if (resolvedPath) {
		return resolvedPath;
	}

	if (!baseUrl) {
		return specifier;
	}

	const absoluteBaseUrl = path.resolve(baseUrl);

	if (fs.existsSync(path.resolve(absoluteBaseUrl, specifier))) {
		return path.resolve(absoluteBaseUrl, specifier);
	}

	if (paths) {
		for (const [key, values] of Object.entries(paths)) {
			const pattern = new RegExp(`^${key.replace(/\*/g, "(.*)")}$`);
			const match = specifier.match(pattern);
			if (match) {
				for (const value of values) {
					const resolvedPath = isExists(path.join(absoluteBaseUrl, value.replace(/\*/g, match[1])));
					if (resolvedPath) {
						return resolvedPath;
					}
				}
			}
		}
	}
	// Caso não tenha tsconfig paths ou não resolva, retorna o especificador original
	return specifier;
};

const compileTypeScript = (filePath: string, onError?: (error: string) => void): string => {
	try {
		const fileContent = validateTypeScript(filePath, onError);

		// Opções de compilação do TypeScript
		const compilerOptions = getTSCompilerOptions(filePath);

		// Compilar o código TypeScript
		let { outputText, sourceMapText } = ts.transpileModule(fileContent, {
			compilerOptions: { ...compilerOptions, sourceMap: true },
			fileName: filePath,
			transformers: {
				before: [
					(context) => {
						return (sourceFile): any => {
							function visitor(node: ts.Node): ts.Node {
								if (ts.isImportDeclaration(node)) {
									const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
									const resolvedModule = resolveModule(moduleSpecifier, path.dirname(filePath), compilerOptions.baseUrl, compilerOptions.paths);
									return ts.factory.updateImportDeclaration(
										node,
										node.modifiers,
										node.importClause,
										ts.factory.createStringLiteral(resolvedModule),
										node.assertClause, // Adiciona o parâmetro assertClause
									);
								}
								return ts.visitEachChild(node, visitor, context);
							}
							return ts.visitNode(sourceFile, visitor);
						};
					},
				],
			},
		});

		outputText = `(async function(){${outputText.replace(/\n\/\/\# sourceMappingURL\=(.+)$/gi, "").replace(/(.)require(.{1,10})/gi, (a, b, c) => {
			if (c.trim().startsWith("(") && !/[a-z_]/gi.test(b)) {
				return `${b}await require${c}`;
			}
			return a;
		})}
        moduleResolve();})();`;

		// Retorna o código JavaScript transpilado
		return `${outputText}\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(sourceMapText ?? "").toString("base64")}`;
	} catch {}
	return "";
};

class Modules extends BasicEventEmitter<{
	error: (mss: string) => void;
}> {
	private cacheModules = new Map<string, any>();
	private cacheObserveModules = new Map<string, { event?: fs.StatsListener; modules: Record<string, () => void> }>();

	async getRequire(p: string): Promise<any> {
		try {
			// Tenta carregar usando require
			return require(p);
		} catch (e1) {
			try {
				return await import(p);
			} catch (e2) {
				throw new Error(`Cannot find module '${p}': ${e2}`);
			}
		}
	}

	hasModule(modulePath: string) {
		return this.cacheModules.has(modulePath);
	}

	observeModules(modulePath: string, observer?: { event?: fs.StatsListener; modules: Record<string, () => void> }): { event?: fs.StatsListener; modules: Record<string, () => void> } {
		if (observer) {
			this.cacheObserveModules.set(modulePath, observer);
		}

		return (
			this.cacheObserveModules.get(modulePath) ?? {
				event: undefined,
				modules: {},
			}
		);
	}

	getGlobalContext(filePath: string, exports: Record<string, any>, resolve: () => void, onMutateImports?: () => void) {
		const globalContext = Object.create(global);

		globalContext["__filename"] = filePath;
		globalContext["__dirname"] = path.dirname(filePath);
		globalContext.console = console;
		globalContext.setTimeout = setTimeout;
		globalContext.clearTimeout = clearTimeout;
		globalContext.setInterval = setInterval;
		globalContext.clearInterval = clearInterval;
		globalContext.process = process;
		globalContext.require = this.createCustomRequire(filePath, onMutateImports);
		globalContext.exports = exports;
		globalContext.moduleResolve = resolve;

		return globalContext;
	}

	createCustomRequire(filePath: string, onMutate?: () => void) {
		const baseDir = path.dirname(filePath);
		return async (modulePath: string) => {
			try {
				const compilerOptions = getTSCompilerOptions(filePath);
				modulePath = resolveModule(modulePath, baseDir, compilerOptions.baseUrl, compilerOptions.paths);

				let absolutePath = fs.existsSync(modulePath)
					? modulePath
					: fs.existsSync(path.join(baseDir, modulePath))
					? path.join(baseDir, modulePath)
					: require.resolve(path.join(baseDir, modulePath));

				const isOnlyApiModule = PathInfo.get(__dirname).equals(absolutePath) || PathInfo.get(__dirname).isParentOf(absolutePath) || PathInfo.get(__dirname).isAncestorOf(absolutePath);

				if (isOnlyApiModule || !fs.existsSync(absolutePath) || absolutePath.includes("node_modules")) {
					throw new Error("Invalid module path");
				}

				if (fs.statSync(absolutePath).isDirectory()) {
					const posibleFiles = fs.readdirSync(absolutePath).find((file) => {
						return (
							file.endsWith("index.js") ||
							file.endsWith("index.ts") ||
							file.endsWith("index.cjs") ||
							file.endsWith("index.mjs") ||
							file.endsWith("index.jsx") ||
							file.endsWith("index.tsx")
						);
					});

					if (posibleFiles) {
						absolutePath = path.resolve(absolutePath, posibleFiles);
					}
				}

				const updateImport = async () => {
					await this.importModule(absolutePath, true, updateImport);
					const callbacks = Object.values(this.observeModules(absolutePath).modules);
					for (const callback of callbacks) {
						callback();
					}
				};

				const module = await this.importModule(absolutePath, false, updateImport);

				const observer = this.observeModules(absolutePath);

				if (observer.event) {
					fs.unwatchFile(absolutePath, observer.event);
				}

				observer.event = (curr, prev) => {
					if (curr.mtime !== prev.mtime) {
						updateImport();
					}
				};

				if (typeof onMutate === "function") {
					observer.modules[filePath] = onMutate;
				}

				this.observeModules(absolutePath, observer);
				fs.watchFile(absolutePath, observer.event);

				return module;
			} catch (err) {
				return await this.getRequire(modulePath);
			}
		};
	}

	async importModule(filePath: string, ignoreCache: boolean = false, onMutateImports?: () => void) {
		if (fs.existsSync(filePath)) {
			if (fs.statSync(filePath).isDirectory()) {
				const posibleFiles = fs.readdirSync(filePath).find((file) => {
					return (
						file.endsWith("index.js") || file.endsWith("index.ts") || file.endsWith("index.cjs") || file.endsWith("index.mjs") || file.endsWith("index.jsx") || file.endsWith("index.tsx")
					);
				});

				if (posibleFiles) {
					filePath = path.resolve(filePath, posibleFiles);
				} else {
					return {};
				}
			}
		} else {
			return await this.getRequire(filePath);
		}

		if (this.cacheModules.has(filePath) && !ignoreCache) {
			return this.cacheModules.get(filePath)!;
		}

		const compiledCode = compileTypeScript(filePath, (error) => {
			this.emit("error", error);
		});
		const exports = {};

		// console.log("compiledCode", compiledCode);

		await new Promise<void>((resolve) => {
			const script = new vm.Script(compiledCode, { filename: filePath });
			const context = vm.createContext(this.getGlobalContext(filePath, exports, resolve, onMutateImports));
			script.runInContext(context);
		});

		this.cacheModules.set(filePath, exports);
		return exports;
	}
}

interface RouteInfo {
	path: string;
	methods: string[];
}

function obterPathsRotas(app: any): RouteInfo[] {
	const rotas: RouteInfo[] = [];

	app.router.stack.forEach((middleware: any) => {
		if (middleware.route) {
			// Rotas definidas com app.get(), app.post(), etc.
			const path = middleware.route.path;
			const methods = Object.keys(middleware.route.methods);
			rotas.push({ path, methods });
		} else if (middleware.handle && middleware.handle.stack) {
			// Rotas definidas com app.use() e roteadores
			middleware.handle.stack.forEach((route: any) => {
				if (route.route) {
					const path = middleware.regexp.toString().replace("\\/?", "").replace("(?=\\/|$)", "").slice(1) + route.route.path;
					const methods = Object.keys(route.route.methods);
					rotas.push({ path, methods });
				}
			});
		}
	});

	return rotas;
}

export class Script {
	private cacheScripts = new Map<string, Modules>();

	constructor(readonly app: Server, readonly rootDir: string) {}

	async createByDatabase(name: string) {
		const dbPath = path.resolve(this.rootDir, "scripts", name);

		if (!fs.existsSync(dbPath)) {
			fs.mkdirSync(dbPath, { recursive: true });
		}

		default_scripts(dbPath);

		const modules = new Modules();

		this.cacheScripts.set(name, modules);

		const Routers = await modules.importModule(path.resolve(dbPath, "src", "Routers/index.ts"));

		try {
			this.app.server.router.use(`/script/${name}`, Routers.default);
		} catch (e) {}

		console.log(obterPathsRotas(this.app.server));
	}

	async restart() {}
}
