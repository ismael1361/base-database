"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_FACTORY = void 0;
const util_1 = require("./util");
exports.ERROR_FACTORY = new util_1.ErrorFactory("base-database", {
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
    ["invalid-server-instance" /* Errors.INVALID_SERVER_INSTANCE */]: {
        template: "Invalid server instance.",
    },
    ["server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */]: {
        template: "Server not initialized.",
    },
    ["server-not-supported" /* Errors.SERVER_NOT_SUPPORTED */]: {
        template: "Server not supported.",
    },
});
//# sourceMappingURL=index.js.map