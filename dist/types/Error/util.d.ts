export type ErrorMap<ErrorCode extends string> = {
    readonly [K in ErrorCode]: string;
};
export interface ErrorData {
    [key: string]: unknown;
}
export declare class MainError extends Error {
    readonly code: string;
    customData?: Record<string, unknown> | undefined;
    readonly name: string;
    constructor(code: string, message: string, customData?: Record<string, unknown> | undefined);
}
export declare class ErrorFactory<ErrorCode extends string, ErrorParams extends {
    readonly [K in ErrorCode]?: ErrorData;
} = {}> {
    private readonly service;
    private readonly serviceName;
    private readonly errors;
    constructor(service: string, serviceName: string, errors: ErrorMap<ErrorCode>);
    create<K extends ErrorCode>(code: K, ...data: K extends keyof ErrorParams ? [ErrorParams[K]] : []): MainError;
}
//# sourceMappingURL=util.d.ts.map