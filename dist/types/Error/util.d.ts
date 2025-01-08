export type ErrorMap<ErrorCode extends PropertyKey> = {
    readonly [K in ErrorCode]: {
        readonly template: string;
        readonly params: PropertyKey[];
    };
};
export type ErrorData<P extends PropertyKey[] = PropertyKey[]> = P extends Array<infer K> ? K extends PropertyKey ? {
    [key in K]: string;
} : {} : {};
export declare class MainError extends Error {
    readonly code: string;
    customData?: Record<string, unknown> | undefined;
    readonly name: string;
    constructor(code: string, message: string, customData?: Record<string, unknown> | undefined);
}
export declare class ErrorFactory<Errors extends ErrorMap<any>> {
    private readonly service;
    private readonly errors;
    constructor(service: string, errors: Errors);
    create<K extends keyof Errors, P extends PropertyKey[] = Errors[K]["params"]>(serviceName: string, code: K, ...data: K extends keyof Errors ? [ErrorData<P>] : []): MainError;
}
//# sourceMappingURL=util.d.ts.map