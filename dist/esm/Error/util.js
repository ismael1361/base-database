const ERROR_NAME = "Error";
export class MainError extends Error {
    code;
    customData;
    name = ERROR_NAME;
    constructor(code, message, customData) {
        super(message);
        this.code = code;
        this.customData = customData;
        Object.setPrototypeOf(this, MainError.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorFactory.prototype.create);
        }
    }
}
const PATTERN = /\{\$([^}]+)}/g;
function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_, key) => {
        const value = data[key];
        return value != null ? String(value) : `<${key}?>`;
    });
}
export class ErrorFactory {
    service;
    serviceName;
    errors;
    constructor(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    create(code, ...data) {
        const customData = data[0] || {};
        const fullCode = `${this.service}/${code}`;
        const template = this.errors[code];
        const message = template ? replaceTemplate(template, customData) : "Error";
        const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
        const error = new MainError(fullCode, fullMessage, customData);
        return error;
    }
}
//# sourceMappingURL=util.js.map