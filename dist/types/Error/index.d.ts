import { ErrorFactory } from "./util";
export declare const enum Errors {
    NO_APP = "no-app",
    BAD_APP_NAME = "bad-app-name",
    DUPLICATE_APP = "duplicate-app",
    APP_DELETED = "app-deleted",
    DB_DISCONNECTED = "db-disconnected",
    DB_CONNECTION_ERROR = "db-connection-error",
    DB_NOT_FOUND = "db-not-found",
    DB_TABLE_NOT_FOUND = "db-table-not-found",
    INVALID_ARGUMENT = "invalid-argument",
    NOT_IMPLEMENTED = "not-implemented",
    INTERNAL_ERROR = "internal-error"
}
export declare const ERROR_FACTORY: ErrorFactory<{
    readonly "no-app": {
        readonly template: string;
        readonly params: ["appName"];
    };
    readonly "bad-app-name": {
        readonly template: "Nome de aplicativo ilegal: '{$appName}";
        readonly params: ["appName"];
    };
    readonly "duplicate-app": {
        readonly template: "O aplicativo chamado '{$appName}' já existe com diferentes opções ou configurações";
        readonly params: ["appName"];
    };
    readonly "app-deleted": {
        readonly template: "Aplicativo chamado '{$appName}' já excluído";
        readonly params: ["appName"];
    };
    readonly "db-disconnected": {
        readonly template: "Banco de dados '{$dbName}' desconectado";
        readonly params: ["dbName"];
    };
    readonly "db-connection-error": {
        readonly template: "Database connection error: {$error}";
        readonly params: ["error"];
    };
    readonly "db-not-found": {
        readonly template: "Banco de dados '{$dbName}' não encontrado";
        readonly params: ["dbName"];
    };
    readonly "db-table-not-found": {
        readonly template: "Tabela '{$tableName}' não encontrada no banco de dados '{$dbName}'";
        readonly params: ["dbName", "tableName"];
    };
    readonly "not-implemented": {
        readonly template: "Not implemented: {$message}";
        readonly params: ["message"];
    };
    readonly "invalid-argument": {
        readonly template: "Invalid argument: {$message}";
        readonly params: ["message"];
    };
    readonly "internal-error": {
        readonly template: "Internal error: {$message}";
        readonly params: ["message"];
    };
}>;
//# sourceMappingURL=index.d.ts.map