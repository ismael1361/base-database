export const isObject = (thing) => {
    return thing !== null && typeof thing === "object";
};
export const deepEqual = (a, b) => {
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
        if (isObject(aProp) && isObject(bProp)) {
            if (!deepEqual(aProp, bProp)) {
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
export const dirname = (path) => {
    const separador = path.includes("\\") ? "\\" : "/";
    const parts = path.split(separador);
    parts.pop();
    return parts.join("/");
};
export const getLocalPath = () => {
    const trace = new Error().stack;
    return dirname(trace
        ?.split("\n")[2]
        .split(" (")[1]
        .replace(/\:(\d+)\:(\d+)\)$/g, "") ?? "./");
};
export const isInstanceOf = (obj, constructor) => {
    return obj != null && obj.constructor === constructor;
};
//# sourceMappingURL=index.js.map