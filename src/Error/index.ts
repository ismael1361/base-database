import { ErrorFactory, ErrorMap } from "./util";

export const enum Errors {
	NO_APP = "no-app",
	BAD_APP_NAME = "bad-app-name",
	DUPLICATE_APP = "duplicate-app",
	APP_DELETED = "app-deleted",
	DB_DISCONNECTED = "db-disconnected",
	DB_CONNECTION_ERROR = "db-connection-error",
	DB_NOT_FOUND = "db-not-found",
	INVALID_ARGUMENT = "invalid-argument",
}

const ERRORS: ErrorMap<Errors> = {
	[Errors.NO_APP]: "Nenhum aplicativo '{$appName}' foi criado - " + "chame inicializeApp() primeiro",
	[Errors.BAD_APP_NAME]: "Nome de aplicativo ilegal: '{$appName}",
	[Errors.DUPLICATE_APP]: "O aplicativo chamado '{$appName}' já existe com diferentes opções ou configurações",
	[Errors.APP_DELETED]: "Aplicativo chamado '{$appName}' já excluído",
	[Errors.DB_DISCONNECTED]: "Banco de dados '{$dbName}' desconectado",
	[Errors.DB_CONNECTION_ERROR]: "Database connection error: {$error}",
	[Errors.DB_NOT_FOUND]: "Banco de dados '{$dbName}' não encontrado",
	[Errors.INVALID_ARGUMENT]: "Invalid argument: {$message}",
};

interface ErrorParams {
	[Errors.NO_APP]: { appName: string };
	[Errors.BAD_APP_NAME]: { appName: string };
	[Errors.DUPLICATE_APP]: { appName: string };
	[Errors.APP_DELETED]: { appName: string };
	[Errors.DB_DISCONNECTED]: { dbName: string };
	[Errors.DB_CONNECTION_ERROR]: { error: string };
	[Errors.DB_NOT_FOUND]: { dbName: string };
	[Errors.INVALID_ARGUMENT]: { message: string };
}

export const ERROR_FACTORY = new ErrorFactory<Errors, ErrorParams>("app", "base-database", ERRORS);
