import Editor, { BeforeMount, OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import styles from "./styles.module.scss";
import { useRef } from "react";

import expressModel from "Resources/monaco/models/express.model";
import routerModel from "Resources/monaco/models/router.model";

const libSources: Record<string, string> = {
	"ts:filename/express.d.ts": expressModel,
	"ts:filename/router.d.ts": routerModel,
};

export const ScriptEditor: React.FC = () => {
	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

	const handleEditorWillMount: BeforeMount = (monaco) => {
		monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: true,
			noSyntaxValidation: false,
		});

		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			lib: ["esnext"],
			target: monaco.languages.typescript.ScriptTarget.ESNext,
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
		});

		for (const libUri in libSources) {
			const libSource = libSources[libUri];
			const modelUri = monaco.Uri.parse(libUri);
			monaco.editor.getModel(modelUri)?.dispose();

			monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
			monaco.editor.createModel(libSource, "typescript", modelUri);
		}
	};

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
	};

	return (
		<div className={styles["script-editor"]}>
			<Editor
				theme="vs-dark"
				width="auto"
				height="auto"
				defaultLanguage="typescript"
				defaultValue={`import Router, { Request, Handler, Middleware } from "router";

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

const AuthMiddleware: Middleware<AuthRequest, any> = (req, res, next) => {}

interface WalletRequest extends Request {
    wallet: {
        uid: string;
        address: string;
        walletAddress: string;
        privateKey: string;
    };
}

const WalletMiddleware: Middleware<WalletRequest & AuthRequest, any> = async (req, res, next) => {}

Router((router)=>{
    router.get("/", [AuthMiddleware, WalletMiddleware], (req)=>{
        const { user, wallet } = req;
    });
});`}
				options={{
					minimap: { enabled: false },
					wordWrap: "on",
				}}
				beforeMount={handleEditorWillMount}
				onMount={handleEditorDidMount}
			/>
		</div>
	);
};
