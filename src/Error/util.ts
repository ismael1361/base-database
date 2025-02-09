export type ErrorMap<ErrorCode extends PropertyKey> = {
	readonly [K in ErrorCode]: {
		readonly template: string;
		readonly params?: PropertyKey[];
	};
};

export type ErrorData<P extends PropertyKey[] = PropertyKey[]> = P extends Array<infer K>
	? K extends PropertyKey
		? {
				[key in K]: PropertyKey;
		  }
		: {}
	: {};

const ERROR_NAME = "Error";

export class MainError extends Error {
	readonly name: string = ERROR_NAME;

	constructor(readonly code: string, message: string, public customData?: Record<string, unknown>) {
		super(message);
		Object.setPrototypeOf(this, MainError.prototype);
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ErrorFactory.prototype.create);
		}
	}
}

const PATTERN = /\{\$([^}]+)}/g;

function replaceTemplate(template: string, data: ErrorData): string {
	return template.replace(PATTERN, (_, key) => {
		const value: any = (data as any)[key];
		return value != null ? String(value) : `<${key}?>`;
	});
}

export class ErrorFactory<Errors extends ErrorMap<any>> {
	constructor(private readonly service: string, private readonly errors: Errors) {}

	create<K extends keyof Errors, P extends PropertyKey[] | undefined = Errors[K]["params"]>(
		serviceName: string,
		code: K,
		...data: K extends keyof Errors ? (P extends PropertyKey[] ? [ErrorData<P>] : any[]) : any[]
	): MainError {
		const customData = (data[0] as ErrorData) || {};
		const fullCode = `${this.service}/${String(code)}`;
		const { template } = this.errors[code];
		const message = template ? replaceTemplate(template, customData) : "Error";
		return new MainError(fullCode, `${serviceName}: ${message} (${fullCode}).`, customData);
	}
}
