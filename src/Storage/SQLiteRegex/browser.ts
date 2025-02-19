import { ERROR_FACTORY, Errors } from "../../Error";

export const implementable = false;

export const getLoadablePath = () => {
	throw ERROR_FACTORY.create("SQLiteRegex", Errors.NOT_IMPLEMENTED, {
		message: "Unsupported platform for sqlite-regex, on a browser environment. Consult the sqlite-regex NPM package README for details.",
	});
};
