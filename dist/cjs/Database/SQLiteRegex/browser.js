"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadablePath = exports.implementable = void 0;
const Error_1 = require("../../Error");
exports.implementable = false;
const getLoadablePath = () => {
    throw Error_1.ERROR_FACTORY.create("SQLiteRegex", "not-implemented" /* Errors.NOT_IMPLEMENTED */, {
        message: "Unsupported platform for sqlite-regex, on a browser environment. Consult the sqlite-regex NPM package README for details.",
    });
};
exports.getLoadablePath = getLoadablePath;
//# sourceMappingURL=browser.js.map