export type ErrorMap<ErrorCode extends string> = {
	readonly [K in ErrorCode]: string;
};

export interface ErrorData {
	[key: string]: unknown;
}

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
		const value = data[key];
		return value != null ? String(value) : `<${key}?>`;
	});
}

export class ErrorFactory<ErrorCode extends string, ErrorParams extends { readonly [K in ErrorCode]?: ErrorData } = {}> {
	constructor(private readonly service: string, private readonly serviceName: string, private readonly errors: ErrorMap<ErrorCode>) {}

	create<K extends ErrorCode>(code: K, ...data: K extends keyof ErrorParams ? [ErrorParams[K]] : []): MainError {
		const customData = (data[0] as ErrorData) || {};
		const fullCode = `${this.service}/${code}`;
		const template = this.errors[code];

		const message = template ? replaceTemplate(template, customData) : "Error";

		const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;

		const error = new MainError(fullCode, fullMessage, customData);

		return error;
	}
}
