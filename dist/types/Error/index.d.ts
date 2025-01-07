import { ErrorFactory } from "./util";
export declare const enum Errors {
    NO_APP = "no-app",
    BAD_APP_NAME = "bad-app-name",
    DUPLICATE_APP = "duplicate-app",
    APP_DELETED = "app-deleted",
    DB_DISCONNECTED = "db-disconnected",
    DB_CONNECTION_ERROR = "db-connection-error",
    DB_NOT_FOUND = "db-not-found",
    INVALID_ARGUMENT = "invalid-argument"
}
interface ErrorParams {
    [Errors.NO_APP]: {
        appName: string;
    };
    [Errors.BAD_APP_NAME]: {
        appName: string;
    };
    [Errors.DUPLICATE_APP]: {
        appName: string;
    };
    [Errors.APP_DELETED]: {
        appName: string;
    };
    [Errors.DB_DISCONNECTED]: {
        dbName: string;
    };
    [Errors.DB_CONNECTION_ERROR]: {
        error: string;
    };
    [Errors.DB_NOT_FOUND]: {
        dbName: string;
    };
    [Errors.INVALID_ARGUMENT]: {
        message: string;
    };
}
export declare const ERROR_FACTORY: ErrorFactory<Errors, ErrorParams>;
export {};
//# sourceMappingURL=index.d.ts.map