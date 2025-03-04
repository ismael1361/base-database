import { DataType, OptionsDataType, Row, Serialize, SerializeDataType, SerializeValueType, TableType } from "./Types";

export const Operators = {
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
} as const;

export const Types: {
	TEXT: string;
	INTEGER: number;
	FLOAT: number;
	BOOLEAN: boolean;
	DATETIME: Date;
	BIGINT: bigint;
	NULL: null;
} = {
	TEXT: "",
	INTEGER: 0,
	FLOAT: 0.1,
	BOOLEAN: true,
	DATETIME: new Date(),
	BIGINT: BigInt(0),
	NULL: null,
} as const;

export const generateUUID = (separator: string = "", version: "v4" | "v7" = "v7") => {
	switch (version) {
		case "v7": {
			return "tttttttt${separator}tttt${separator}7xxx${separator}yxxx${separator}xxxxxxxxxxxx"
				.replace(/[xy]/g, function (c) {
					const r = Math.trunc(Math.random() * 16);
					const v = c == "x" ? r : (r & 0x3) | 0x8;
					return v.toString(16);
				})
				.replace(/^[t]{8}-[t]{4}/, function () {
					const unixtimestamp = Date.now().toString(16).padStart(12, "0");
					return unixtimestamp.slice(0, 8) + "-" + unixtimestamp.slice(8);
				});
		}
		default: {
			let currentTime = Date.now();
			return `xxxxxxxx${separator}xxxx${separator}4xxx${separator}yxxx${separator}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
				const r = (currentTime + Math.random() * 16) % 16 | 0;
				return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
			});
		}
	}
};

export const columns = <T extends TableType>(columns: Serialize<T>): Serialize<T> => {
	return Object.keys(columns).reduce((acc, key) => {
		acc[key] = {
			type: columns[key].type,
			primaryKey: columns[key].primaryKey ?? false,
			autoIncrement: columns[key].autoIncrement ?? false,
			notNull: columns[key].notNull ?? false,
			default: columns[key].default,
			unique: columns[key].unique ?? false,
			check: columns[key].check,
			options: columns[key].options,
		};
		return acc;
	}, {} as any);
};

export const isLiteralObject = (obj: any): boolean => {
	return obj !== null && typeof obj === "object" && !(obj instanceof Object.constructor);
};

export const cloneObject = <T>(obj: T): T => {
	const result: any = Array.isArray(obj) ? [] : {};
	for (const key in obj) {
		if (typeof obj[key] === "object" && obj[key] !== null && ![Date, RegExp].includes(obj[key].constructor as any)) {
			result[key] = isLiteralObject(obj[key]) ? cloneObject(obj[key]) : Object.assign(Object.create(Object.getPrototypeOf(obj[key])), obj[key]);
		} else {
			result[key] = obj[key];
		}
	}
	return result;
};

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
export const getDatatype = <T extends null | string | bigint | number | boolean | Date>(value: T): DataType<T> => {
	if (["NULL", "TEXT", "BIGINT", "INTEGER", "FLOAT", "BOOLEAN", "DATETIME"].includes(value as any)) return value as any;
	if (value === null) return "NULL" as any;
	if (typeof value === "string") return "TEXT" as any;
	if (typeof value === "bigint") return "BIGINT" as any;
	if (typeof value === "number") return parseInt(value.toString()).toString() === value.toString() ? ("INTEGER" as any) : ("FLOAT" as any);
	if (typeof value === "boolean") return "BOOLEAN" as any;
	if (value instanceof Date) return "DATETIME" as any;
	return "TEXT" as any;
};

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
export const verifyDatatype = <T extends OptionsDataType>(value: any, type: T): value is T => {
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

const processDefaultValue = (defaultValue: SerializeDataType<any>[string]["default"]) => {
	if (typeof defaultValue === "function") {
		return defaultValue();
	} else if (typeof defaultValue === "string") {
		switch (defaultValue.trim()) {
			case "CURRENT_TIMESTAMP":
				return new Date();
			case "UUID":
				return generateUUID();
			default:
				return defaultValue;
		}
	} else {
		return defaultValue;
	}
};

const processValueType = (type: OptionsDataType, value: SerializeValueType, invert: boolean = false) => {
	switch (type) {
		case "TEXT":
			return typeof value === "string" ? value : undefined;
		case "INTEGER":
		case "FLOAT":
			return typeof value === "number" ? value : undefined;
		case "BOOLEAN":
			return typeof value === "boolean" ? value : undefined;
		case "DATETIME":
			if (invert) return value instanceof Date ? value : typeof value === "number" ? new Date(value) : undefined;
			if (!invert) return value instanceof Date ? value.getTime() : typeof value === "number" ? value : undefined;
			break;
		case "BIGINT":
			return typeof value === "bigint" ? value : ["string", "number"].includes(typeof value) ? BigInt(value as any) : undefined;
		case "NULL":
			return value === null ? value : undefined;
	}

	return undefined;
};

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
export const serializeDataForSet = <T extends TableType, P extends boolean = false>(
	serialize: SerializeDataType<T>,
	data: Partial<Row<T>>,
	isPartial: P = false as P,
): Promise<P extends true ? Partial<Row<T>> : Row<T>> => {
	return new Promise((resolve, reject) => {
		for (const key in isPartial ? data : serialize) {
			if (!(key in data)) {
				if (serialize[key].default !== undefined) {
					(data as any)[key] = processDefaultValue(serialize[key].default);
				}
				// else if (!serialize[key].autoIncrement) {
				// 	return reject(new Error(`Missing column ${key}`));
				// }
			}

			if (serialize[key].autoIncrement) {
				delete data[key];
				continue;
			}

			if (serialize[key].notNull && (!(key in data) || data[key] === null || data[key] === undefined)) {
				return reject(new Error(`Column ${key} cannot be null or undefined`));
			}

			if (key in data && data[key] !== null && data[key] !== undefined) {
				if (!verifyDatatype(data[key], getDatatype(serialize[key].type))) {
					return reject(new Error(`Invalid datatype for column ${key}`));
				}

				if (typeof data[key] === "string" && Array.isArray(serialize[key].options) && serialize[key].options.length > 0) {
					if (!serialize[key].options.includes(data[key])) {
						return reject(new Error(`Invalid value for column ${key}`));
					}
				}

				if (typeof serialize[key].check === "function") {
					try {
						const isValid = (serialize as any)[key].check(data[key]);
						if (isValid instanceof Error) return reject(isValid);
					} catch (e) {
						const message = "message" in (e as any) ? (e as any).message : "Invalid value, error thrown: " + String(e);
						return reject(new Error(message));
					}
				}
			}

			(data as any)[key] = processValueType(getDatatype(serialize[key].type), (data as any)[key]);

			if (data[key] === undefined) {
				delete data[key];
			}
		}

		resolve(data as any);
	});
};

export const serializeDataForGet = <T extends TableType, D extends Partial<Row<T>> | Array<Partial<Row<T>>>>(
	serialize: SerializeDataType<T>,
	data: D,
): Promise<D extends Array<Partial<Row<T>>> ? Array<Row<T>> : Row<T>> => {
	return new Promise((resolve, reject) => {
		const list: Array<Partial<Row<T>>> = ((Array.isArray(data) ? data : [data]) as Array<Partial<Row<T>>>).map((data) => {
			for (const key in serialize) {
				if (!(key in data)) {
					if (serialize[key].default !== undefined) {
						(data as any)[key] = processDefaultValue(serialize[key].default);
					}
				}

				(data as any)[key] = processValueType(getDatatype(serialize[key].type), (data as any)[key], true);

				if (data[key] !== null && data[key] !== undefined && !verifyDatatype(data[key], getDatatype(serialize[key].type))) {
					delete data[key];
				}

				if (data[key] !== null && data[key] !== undefined && typeof serialize[key].check === "function") {
					try {
						const isValid = (serialize as any)[key].check(data[key]);
						if (isValid instanceof Error) {
							delete data[key];
						}
					} catch (e) {
						delete data[key];
					}
				}
			}

			return data;
		});

		resolve(Array.isArray(data) ? (list as any) : (list[0] as any));
	});
};
