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

export const ERROR_FACTORY = new ErrorFactory("app", "base-database", {
	[Errors.NO_APP]: {
		template: "Nenhum aplicativo '{$appName}' foi criado - " + "chame inicializeApp() primeiro",
		params: ["appName"],
	},
	[Errors.BAD_APP_NAME]: {
		template: "Nome de aplicativo ilegal: '{$appName}",
		params: ["appName"],
	},
	[Errors.DUPLICATE_APP]: {
		template: "O aplicativo chamado '{$appName}' já existe com diferentes opções ou configurações",
		params: ["appName"],
	},
	[Errors.APP_DELETED]: {
		template: "Aplicativo chamado '{$appName}' já excluído",
		params: ["appName"],
	},
	[Errors.DB_DISCONNECTED]: {
		template: "Banco de dados '{$dbName}' desconectado",
		params: ["dbName"],
	},
	[Errors.DB_CONNECTION_ERROR]: {
		template: "Database connection error: {$error}",
		params: ["error"],
	},
	[Errors.DB_NOT_FOUND]: {
		template: "Banco de dados '{$dbName}' não encontrado",
		params: ["dbName"],
	},
	[Errors.INVALID_ARGUMENT]: {
		template: "Invalid argument: {$message}",
		params: ["message"],
	},
} as const);
