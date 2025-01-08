import { ERROR_FACTORY } from "../../Error";
export const implementable = false;
export const getLoadablePath = () => {
    throw ERROR_FACTORY.create("SQLiteRegex", "not-implemented" /* Errors.NOT_IMPLEMENTED */, {
        message: "Unsupported platform for sqlite-regex, on a browser environment. Consult the sqlite-regex NPM package README for details.",
    });
};
//# sourceMappingURL=browser.js.map