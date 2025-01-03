"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDataForGet = exports.serializeDataForSet = exports.verifyDatatype = exports.getDatatype = exports.cloneObject = exports.isLiteralObject = exports.columns = exports.generateUUID = exports.Types = exports.Operators = void 0;
exports.Operators = {
    EQUAL: "=",
    NOT_EQUAL: "!=",
    GREATER_THAN: ">",
    LESS_THAN: "<",
    GREATER_THAN_OR_EQUAL: ">=",
    LESS_THAN_OR_EQUAL: "<=",
    BETWEEN: "BETWEEN",
    NOT_BETWEEN: "NOT BETWEEN",
    LIKE: "LIKE",
    NOT_LIKE: "NOT LIKE",
    IN: "IN",
    NOT_IN: "NOT IN",
};
exports.Types = {
    TEXT: "",
    INTEGER: 0,
    FLOAT: 0.1,
    BOOLEAN: true,
    DATETIME: new Date(),
    BIGINT: BigInt(0),
    NULL: null,
};
const generateUUID = (separator = "") => {
    let currentTime = Date.now();
    return `xxxxxxxx${separator}xxxx${separator}4xxx${separator}yxxx${separator}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
        const r = (currentTime + Math.random() * 16) % 16 | 0;
        currentTime = Math.floor(currentTime / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
};
exports.generateUUID = generateUUID;
const columns = (columns) => {
    return Object.keys(columns).reduce((acc, key) => {
        acc[key] = {
            type: columns[key].type,
            primaryKey: columns[key].primaryKey ?? false,
            autoIncrement: columns[key].autoIncrement ?? false,
            notNull: columns[key].notNull ?? false,
            default: columns[key].default,
            unique: columns[key].unique ?? false,
            check: columns[key].check,
        };
        return acc;
    }, {});
};
exports.columns = columns;
const isLiteralObject = (obj) => {
    return obj !== null && typeof obj === "object" && !(obj instanceof Object.constructor);
};
exports.isLiteralObject = isLiteralObject;
const cloneObject = (obj) => {
    const result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null && ![Date, RegExp].includes(obj[key].constructor)) {
            result[key] = (0, exports.isLiteralObject)(obj[key]) ? (0, exports.cloneObject)(obj[key]) : Object.assign(Object.create(Object.getPrototypeOf(obj[key])), obj[key]);
        }
        else {
            result[key] = obj[key];
        }
    }
    return result;
};
exports.cloneObject = cloneObject;
/**
 * Get the datatype of a value
 * @param value The value to get the datatype of
 * @returns The datatype of the value
 * @example
 * getDatatype(null); // "NULL"
 * getDatatype("hello"); // "TEXT"
 * getDatatype(123n); // "BIGINT"
 * getDatatype(123); // "INTEGER"
 * getDatatype(123.456); // "FLOAT"
 * getDatatype(true); // "BOOLEAN"
 * getDatatype(new Date()); // "DATETIME"
 * getDatatype(Symbol("hello")); // "TEXT"
 */
const getDatatype = (value) => {
    if (["NULL", "TEXT", "BIGINT", "INTEGER", "FLOAT", "BOOLEAN", "DATETIME"].includes(value))
        return value;
    if (value === null)
        return "NULL";
    if (typeof value === "string")
        return "TEXT";
    if (typeof value === "bigint")
        return "BIGINT";
    if (typeof value === "number")
        return parseInt(value.toString()).toString() === value.toString() ? "INTEGER" : "FLOAT";
    if (typeof value === "boolean")
        return "BOOLEAN";
    if (value instanceof Date)
        return "DATETIME";
    return "TEXT";
};
exports.getDatatype = getDatatype;
/**
 * Verify if a value is of a certain datatype
 * @param value The value to verify
 * @param type The datatype to verify
 * @returns If the value is of the datatype
 * @example
 * verifyDatatype("hello", "TEXT"); // true
 * verifyDatatype(123, "INTEGER"); // true
 * verifyDatatype(123.456, "FLOAT"); // true
 * verifyDatatype(true, "BOOLEAN"); // true
 * verifyDatatype(new Date(), "DATETIME"); // true
 * verifyDatatype(null, "NULL"); // true
 * verifyDatatype("hello", "INTEGER"); // false
 * verifyDatatype(123, "FLOAT"); // false
 * verifyDatatype(123.456, "INTEGER"); // false
 */
const verifyDatatype = (value, type) => {
    switch (type) {
        case "TEXT":
            return typeof value === "string";
        case "INTEGER":
            return parseInt(value) === value;
        case "FLOAT":
            return parseFloat(value) === value;
        case "BOOLEAN":
            return typeof value === "boolean";
        case "DATETIME":
            return value instanceof Date;
        case "BIGINT":
            return typeof value === "bigint";
        case "NULL":
            return value === null;
    }
    return false;
};
exports.verifyDatatype = verifyDatatype;
/**
 * Serialize data
 * @param serialize The serialize datatype
 * @param data The data to serialize
 * @param isPartial If the data is partial
 * @returns A promise
 * @throws If a column is missing
 * @throws If a column is null and not nullable
 * @throws If a column has an invalid datatype
 * @example
 * serializeData({
 *     id: { type: "INTEGER", primaryKey: true },
 *     name: { type: "TEXT", notNull: true },
 * }, { id: 123, name: "hello" }); // Promise<void>
 */
const serializeDataForSet = (serialize, data, isPartial = false) => {
    return new Promise((resolve, reject) => {
        for (const key in isPartial ? data : serialize) {
            if (!(key in data)) {
                if (serialize[key].default !== undefined) {
                    data[key] = typeof serialize[key].default === "function" ? serialize[key].default() : serialize[key].default;
                }
                // else if (!serialize[key].autoIncrement) {
                // 	return reject(new Error(`Missing column ${key}`));
                // }
            }
            if (serialize[key].autoIncrement) {
                delete data[key];
            }
            else {
                if (serialize[key].notNull && (!(key in data) || data[key] === null || data[key] === undefined)) {
                    return reject(new Error(`Column ${key} cannot be null or undefined`));
                }
                if (key in data && data[key] !== null && data[key] !== undefined) {
                    if (!(0, exports.verifyDatatype)(data[key], (0, exports.getDatatype)(serialize[key].type))) {
                        return reject(new Error(`Invalid datatype for column ${key}`));
                    }
                    if (typeof data[key] === "string" && Array.isArray(serialize[key].options) && serialize[key].options.length > 0) {
                        if (!serialize[key].options.includes(data[key])) {
                            return reject(new Error(`Invalid value for column ${key}`));
                        }
                    }
                    if (typeof serialize[key].check === "function") {
                        try {
                            const isValid = serialize[key].check(data[key]);
                            if (isValid instanceof Error)
                                return reject(isValid);
                        }
                        catch (e) {
                            const message = "message" in e ? e.message : "Invalid value, error thrown: " + String(e);
                            return reject(new Error(message));
                        }
                    }
                }
            }
        }
        resolve(data);
    });
};
exports.serializeDataForSet = serializeDataForSet;
const serializeDataForGet = (serialize, data) => {
    return new Promise((resolve, reject) => {
        const list = (Array.isArray(data) ? data : [data]).map((data) => {
            for (const key in serialize) {
                if (!(key in data)) {
                    if (serialize[key].default !== undefined) {
                        data[key] = typeof serialize[key].default === "function" ? serialize[key].default() : serialize[key].default;
                    }
                }
                if (data[key] !== null && data[key] !== undefined && !(0, exports.verifyDatatype)(data[key], (0, exports.getDatatype)(serialize[key].type))) {
                    delete data[key];
                }
                if (data[key] !== null && data[key] !== undefined && typeof serialize[key].check === "function") {
                    try {
                        const isValid = serialize[key].check(data[key]);
                        if (isValid instanceof Error) {
                            delete data[key];
                        }
                    }
                    catch (e) {
                        delete data[key];
                    }
                }
            }
            return data;
        });
        resolve(Array.isArray(data) ? list : list[0]);
    });
};
exports.serializeDataForGet = serializeDataForGet;
//# sourceMappingURL=Utils.js.map