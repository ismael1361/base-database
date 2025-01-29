import Editor, { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import styles from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";

import expressModel from "Resources/monaco/models/express.model";
import routerModel from "Resources/monaco/models/router.model";
import { useDebouncedCallback } from "UseHooks";
import { Header } from "./Header";
import { FilesTree } from "./FilesTree";

const libSources: Record<string, string> = {
	"ts:filename/express.d.ts": expressModel,
	"ts:filename/router.d.ts": routerModel,
};

export const ScriptEditor: React.FC = () => {
	const [currentFile, setCurrentFile] = useState<string>("file:///src/Routers/index.ts");
	const [filesList, setFilesList] = useState<string[]>([]);

	const files = useRef<Record<string, string>>({
		"file:///src/Routers/dashboard/index.ts": `import { Router } from "utils";

export default Router([], (router)=>{
    router.get("/", [], (req)=>{

    });
});`,
		"file:///src/Routers/dashboard/user/index.ts": `import { Router } from "utils";
        
export default Router([], (router)=>{
    router.get("/", [], (req)=>{

    });
});`,
		"file:///src/Routers/index.ts": `import { Router } from "utils";
import { Auth, Wallet } from "Middlewares";

export default Router([Auth.middleware, Wallet.middleware], (router)=>{
    router.get("/", [], (req)=>{
        const { user, wallet } = req;
    });
});`,
		"file:///src/Middlewares/index.ts": `import { Request, MiddlewaresBase, Middleware } from "utils";

type UserAccessToken = {
    access_token: string;
    database: string;
    uid: string;
    created: number;
    ip: string;
};

interface AuthRequest extends Request {
    user: UserAccessToken;
}

export const Auth:MiddlewaresBase<{
    middleware: Middleware<AuthRequest>;
}> = {
    middleware(req, res, next){}
}

interface WalletRequest extends AuthRequest {
    wallet: {
        uid: string;
        address: string;
        walletAddress: string;
        privateKey: string;
    };
}

export const Wallet:MiddlewaresBase<{
    middleware: Middleware<WalletRequest>;
}> = {
    middleware(req, res, next){}
}`,
		"file:///src/Scripts/index.ts": `export const promiseIsPending = async <T = any>(p: Promise<T>): Promise<boolean> => {
    const PENDING = Symbol.for("PENDING");
    const result = await Promise.race([p, Promise.resolve(PENDING)]);
    return result === PENDING;
};`,
	});

	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof Monaco | null>(null);

	const handleEditorWillMount: BeforeMount = (monaco) => {
		for (const libUri in libSources) {
			const libSource = libSources[libUri];
			const modelUri = monaco.Uri.parse(libUri);
			monaco.editor.getModel(modelUri)?.dispose();

			monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);
			monaco.editor.createModel(libSource, "typescript", modelUri);
		}

		for (const file in files.current) {
			const modelUri = monaco.Uri.parse(file);
			monaco.editor.getModel(modelUri)?.dispose();
			monaco.editor.createModel(files.current[file], "typescript", modelUri);
		}

		monacoRef.current = monaco;
	};

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		// monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		// 	noSemanticValidation: true,
		// 	noSyntaxValidation: false,
		// });

		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			lib: ["esnext"],
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			listEmittedFiles: false,
			allowNonTsExtensions: true,
			allowJs: true,
			checkJs: false,
			noFallthroughCasesInSwitch: true,
			noEmitOnError: true,
			strict: true,
			noImplicitAny: false,
			skipLibCheck: true,
			esModuleInterop: true,
			pretty: true,
			allowImportingTsExtensions: true,
			allowSyntheticDefaultImports: true,
			alwaysStrict: true,
			resolveJsonModule: true,
			baseUrl: "file:///src/",
			rootDir: "file:///src/",
			paths: {
				"*": ["file:///src/*"],
			},
		});

		setFilesList(
			Object.keys(files.current)
				.map((file) => monaco.Uri.parse(file).path.replace(/^\/src\//, "/") ?? null)
				.filter((file) => file !== null) as string[],
		);
	};

	const updateCurrentFile = useDebouncedCallback((file: string, value: string) => {
		files.current[file] = value;
	}, 100);

	const handleEditorChange =
		(currentFile: string): OnChange =>
		(value) => {
			if (value) {
				updateCurrentFile(currentFile, value);
			}
		};

	const handleOpenFile = useDebouncedCallback((path: string) => {
		const file = Object.keys(files.current).find((file) => {
			return monacoRef.current?.Uri.parse(file).path.endsWith(path);
		});
		if (file) {
			setCurrentFile(file);
			if (monacoRef.current) {
				const modelUri = monacoRef.current.Uri.parse(file);
				monacoRef.current.editor.getModel(modelUri)?.dispose();
				monacoRef.current.editor.createModel(files.current[file], "typescript", modelUri);
			}
		}
	}, 100);

	return (
		<div className={styles["script-editor"]}>
			<Header />
			<div className={styles["workspace"]}>
				<FilesTree
					currentPath={monacoRef.current?.Uri.parse(currentFile).path.replace(/^\/src\//, "/")}
					files={{
						routers: filesList.filter((file) => file?.startsWith("/Routers")),
						middlewares: filesList.filter((file) => file?.startsWith("/Middlewares")),
						scripts: filesList.filter((file) => file?.startsWith("/Scripts")),
					}}
					onFileOpen={handleOpenFile}
				/>
				<Editor
					theme="vs-dark"
					width="auto"
					height="auto"
					path={currentFile}
					defaultLanguage="typescript"
					defaultValue={files.current[currentFile]}
					onChange={handleEditorChange(currentFile)}
					options={{
						minimap: { enabled: false },
						wordWrap: "on",
						autoIndent: "advanced",
						insertSpaces: true,
						tabSize: 4,
						suggestSelection: "first",
						detectIndentation: true,
						guides: {
							bracketPairs: true,
						},
					}}
					beforeMount={handleEditorWillMount}
					onMount={handleEditorDidMount}
				/>
			</div>
		</div>
	);
};
