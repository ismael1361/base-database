import { ErrorFactory } from "./util";
export const ERROR_FACTORY = new ErrorFactory("base-database", {
    ["no-app" /* Errors.NO_APP */]: {
        template: "Nenhum aplicativo '{$appName}' foi criado - " + "chame inicializeApp() primeiro",
        params: ["appName"],
    },
    ["bad-app-name" /* Errors.BAD_APP_NAME */]: {
        template: "Nome de aplicativo ilegal: '{$appName}",
        params: ["appName"],
    },
    ["duplicate-app" /* Errors.DUPLICATE_APP */]: {
        template: "O aplicativo chamado '{$appName}' já existe com diferentes opções ou configurações",
        params: ["appName"],
    },
    ["app-deleted" /* Errors.APP_DELETED */]: {
        template: "Aplicativo chamado '{$appName}' já excluído",
        params: ["appName"],
    },
    ["db-disconnected" /* Errors.DB_DISCONNECTED */]: {
        template: "Banco de dados '{$dbName}' desconectado",
        params: ["dbName"],
    },
    ["db-connection-error" /* Errors.DB_CONNECTION_ERROR */]: {
        template: "Database connection error: {$error}",
        params: ["error"],
    },
    ["db-not-found" /* Errors.DB_NOT_FOUND */]: {
        template: "Banco de dados '{$dbName}' não encontrado",
        params: ["dbName"],
    },
    ["db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */]: {
        template: "Tabela '{$tableName}' não encontrada no banco de dados '{$dbName}'",
        params: ["dbName", "tableName"],
    },
    ["not-implemented" /* Errors.NOT_IMPLEMENTED */]: {
        template: "Not implemented: {$message}",
        params: ["message"],
    },
    ["invalid-argument" /* Errors.INVALID_ARGUMENT */]: {
        template: "Invalid argument: {$message}",
        params: ["message"],
    },
    ["internal-error" /* Errors.INTERNAL_ERROR */]: {
        template: "Internal error: {$message}",
        params: ["message"],
    },
});
//# sourceMappingURL=index.js.map