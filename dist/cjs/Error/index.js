"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_FACTORY = void 0;
const util_1 = require("./util");
const ERRORS = {
    ["no-app" /* Errors.NO_APP */]: "Nenhum aplicativo '{$appName}' foi criado - " + "chame inicializeApp() primeiro",
    ["bad-app-name" /* Errors.BAD_APP_NAME */]: "Nome de aplicativo ilegal: '{$appName}",
    ["duplicate-app" /* Errors.DUPLICATE_APP */]: "O aplicativo chamado '{$appName}' já existe com diferentes opções ou configurações",
    ["app-deleted" /* Errors.APP_DELETED */]: "Aplicativo chamado '{$appName}' já excluído",
    ["db-disconnected" /* Errors.DB_DISCONNECTED */]: "Banco de dados '{$dbName}' desconectado",
    ["db-connection-error" /* Errors.DB_CONNECTION_ERROR */]: "Database connection error: {$error}",
    ["db-not-found" /* Errors.DB_NOT_FOUND */]: "Banco de dados '{$dbName}' não encontrado",
    ["invalid-argument" /* Errors.INVALID_ARGUMENT */]: "Invalid argument: {$message}",
};
exports.ERROR_FACTORY = new util_1.ErrorFactory("app", "base-database", ERRORS);
//# sourceMappingURL=index.js.map