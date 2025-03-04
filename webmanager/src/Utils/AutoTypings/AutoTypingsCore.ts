import { SourceCache } from "./SourceCache";
import { Options } from "./Options";
import { DummySourceCache } from "./DummySourceCache";
import { UnpkgSourceResolver } from "./UnpkgSourceResolver";
import { JsDelivrSourceResolver } from "./JsDelivrSourceResolver";
import { ImportResolver } from "./ImportResolver";
import * as path from "path";
import type * as monaco from "monaco-editor";
import { invokeUpdate } from "./invokeUpdate";
import { RecursionDepth } from "./RecursionDepth";

type Editor = monaco.editor.ICodeEditor | monaco.editor.IStandaloneCodeEditor;

export class AutoTypingsCore implements monaco.IDisposable {
	private static sharedCache?: SourceCache;
	private importResolver: ImportResolver;
	private debounceTimer?: number;
	private isResolving?: boolean;
	private disposables: monaco.IDisposable[];

	public constructor(private editor: Editor, private options: Options) {
		this.disposables = [];
		this.importResolver = new ImportResolver(options);
		const changeModelDisposable = editor.onDidChangeModelContent((e) => {
			this.debouncedResolveContents();
		});
		this.disposables.push(changeModelDisposable);
		this.resolveContents();
		if (!options.dontAdaptEditorOptions) {
			options.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				rootDir: options.fileRootPath,
				...options.monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
				moduleResolution: options.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				allowSyntheticDefaultImports: true,
			});
		}
	}

	public static async create(editor: Editor, options?: Partial<Options>): Promise<AutoTypingsCore> {
		if (options?.shareCache && options.sourceCache && !AutoTypingsCore.sharedCache) {
			AutoTypingsCore.sharedCache = options.sourceCache;
		}

		const monacoInstance = options?.monaco;

		if (!monacoInstance) {
			throw new Error("monacoInstance not found, you can specify the monaco instance via options.monaco");
		}

		return new AutoTypingsCore(editor, {
			fileRootPath: "inmemory://model/",
			onlySpecifiedPackages: false,
			preloadPackages: false,
			shareCache: false,
			dontAdaptEditorOptions: false,
			dontRefreshModelValueAfterResolvement: false,
			sourceCache: AutoTypingsCore.sharedCache ?? new DummySourceCache(),
			sourceResolver: options?.sourceResolver ?? new JsDelivrSourceResolver(),
			debounceDuration: 4000,
			fileRecursionDepth: 10,
			packageRecursionDepth: 3,
			...options,
			monaco: monacoInstance,
		});
	}

	public dispose() {
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
	}

	public setVersions(versions: { [packageName: string]: string }) {
		this.importResolver.setVersions(versions);
		this.options.versions = versions;
	}

	public async clearCache() {
		await this.options.sourceCache.clear();
	}

	private debouncedResolveContents() {
		if (this.isResolving) {
			return;
		}

		invokeUpdate(
			{
				type: "CodeChanged",
			},
			this.options,
		);

		if (this.options.debounceDuration <= 0) {
			this.resolveContents();
		} else {
			if (this.debounceTimer !== undefined) {
				clearTimeout(this.debounceTimer);
			}
			this.debounceTimer = setTimeout(async () => {
				await this.resolveContents();
				this.debounceTimer = undefined;
			}, this.options.debounceDuration) as any;
		}
	}

	async resolveImportsInFile(source: string, uri: monaco.Uri) {
		try {
			await this.importResolver.resolveImportsInFile(source, path.dirname(uri.toString()), new RecursionDepth(this.options));
		} catch (e) {
			if (this.options.onError) {
				this.options.onError((e as Error).message ?? e);
			}
			return Promise.resolve();
		}

		const model = this.editor.getModel();
		if (!model) {
			return;
		}

		if (this.importResolver.wereNewImportsResolved()) {
			if (!this.options.dontRefreshModelValueAfterResolvement) {
				const currentPosition = this.editor.getPosition();
				model.setValue(model.getValue());
				if (currentPosition) {
					this.editor.setPosition(currentPosition);
				}
			}
			this.importResolver.resetNewImportsResolved();
		}
	}

	private async resolveContents() {
		this.isResolving = true;
		invokeUpdate(
			{
				type: "ResolveNewImports",
			},
			this.options,
		);

		const model = this.editor.getModel();
		if (!model) {
			throw Error("No model");
		}

		const content = model.getLinesContent();

		await this.resolveImportsInFile(content.join("\n"), model.uri);

		this.isResolving = false;
	}
}
