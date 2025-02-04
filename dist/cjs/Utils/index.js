"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInstanceOf = exports.getLocalPath = exports.dirname = exports.deepEqual = exports.isObject = void 0;
const isObject = (thing) => {
    return thing !== null && typeof thing === "object";
};
exports.isObject = isObject;
const deepEqual = (a, b) => {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    for (const k of aKeys) {
        if (!bKeys.includes(k)) {
            return false;
        }
        const aProp = a[k];
        const bProp = b[k];
        if ((0, exports.isObject)(aProp) && (0, exports.isObject)(bProp)) {
            if (!(0, exports.deepEqual)(aProp, bProp)) {
                return false;
            }
        }
        else if (aProp !== bProp) {
            return false;
        }
    }
    for (const k of bKeys) {
        if (!aKeys.includes(k)) {
            return false;
        }
    }
    return true;
};
exports.deepEqual = deepEqual;
const dirname = (path) => {
    const separador = path.includes("\\") ? "\\" : "/";
    const parts = path.split(separador);
    parts.pop();
    return parts.join("/");
};
exports.dirname = dirname;
const getLocalPath = () => {
    const trace = new Error().stack;
    return (0, exports.dirname)(trace
        ?.split("\n")[2]
        .split(" (")[1]
        .replace(/\:(\d+)\:(\d+)\)$/g, "") ?? "./");
};
exports.getLocalPath = getLocalPath;
const isInstanceOf = (obj, constructor) => {
    return obj != null && obj.constructor === constructor;
};
exports.isInstanceOf = isInstanceOf;
//# sourceMappingURL=index.js.map