import path from "path";
import fs from "fs";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const result = md.parse(fs.readFileSync(path.resolve(__dirname, "scripts-files"), "utf-8"), {
	breaks: false,
	html: false,
});

const files = new Map<string, string>();
let currentFile = "";

result.forEach((node) => {
	if (typeof node.content === "string") {
		if (node.type === "inline") {
			currentFile = node.content;
		} else if (node.tag === "code") {
			files.set(currentFile, node.content);
		}
	}
});

const verifyExistsFile = (filePath: string, content: string) => {
	const dirPath = path.dirname(filePath);

	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content);
	}
};

export const default_scripts = (rootPath: string) => {
	console.log(files.keys());

	verifyExistsFile(
		path.resolve(rootPath, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					lib: ["ESNext", "ES2015"],
					target: "ESNext",
					moduleResolution: "node",
					listEmittedFiles: false,
					allowJs: true,
					checkJs: false,
					noFallthroughCasesInSwitch: true,
					noEmitOnError: true,
					strict: true,
					noImplicitAny: false,
					skipLibCheck: true,
					esModuleInterop: true,
					pretty: true,
					allowSyntheticDefaultImports: true,
					alwaysStrict: true,
					resolveJsonModule: true,
					rootDir: "./src",
					declaration: true,
					declarationDir: "./types",
				},
			},
			null,
			4,
		),
	);

	files.forEach((content, file) => {
		verifyExistsFile(path.resolve(rootPath, "src", file), content);
	});
};
