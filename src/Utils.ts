import { DataType, OptionsDataType, Row, Serialize, SerializeDataType } from "./Types";

export const Operators = {
	EQUAL: "=",
	NOT_EQUAL: "!=",
	GREATER_THAN: ">",
	LESS_THAN: "<",
	GREATER_THAN_OR_EQUAL: ">=",
	LESS_THAN_OR_EQUAL: "<=",
	BETWEEN: "BETWEEN",
	LIKE: "LIKE",
	IN: "IN",
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
};

export const generateUUID = (separator: string = "") => {
	let currentTime = Date.now();
	return `xxxxxxxx${separator}xxxx${separator}4xxx${separator}yxxx${separator}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
		const r = (currentTime + Math.random() * 16) % 16 | 0;
		currentTime = Math.floor(currentTime / 16);
		return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
	});
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
export const serializeDataForSet = <S extends Serialize, P extends boolean = false>(
	serialize: SerializeDataType<S>,
	data: Partial<Row<S>>,
	isPartial: P = false as P,
): Promise<P extends true ? Partial<Row<S>> : Row<S>> => {
	return new Promise((resolve, reject) => {
		for (const key in isPartial ? data : serialize) {
			if (!(key in data)) {
				if (serialize[key].default !== undefined) {
					(data as any)[key] = typeof serialize[key].default === "function" ? (serialize[key].default as any)() : serialize[key].default;
				}
				// else if (!serialize[key].autoIncrement) {
				// 	return reject(new Error(`Missing column ${key}`));
				// }
			}
			if (serialize[key].autoIncrement) {
				delete data[key];
			} else {
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
			}
		}

		resolve(data as any);
	});
};

export const serializeDataForGet = <S extends Serialize, D extends Partial<Row<S>> | Array<Partial<Row<S>>>>(
	serialize: SerializeDataType<S>,
	data: D,
): Promise<D extends Array<Partial<Row<S>>> ? Array<Row<S>> : Row<S>> => {
	return new Promise((resolve, reject) => {
		const list: Array<Partial<Row<S>>> = ((Array.isArray(data) ? data : [data]) as Array<Partial<Row<S>>>).map((data) => {
			for (const key in serialize) {
				if (!(key in data)) {
					if (serialize[key].default !== undefined) {
						(data as any)[key] = typeof serialize[key].default === "function" ? (serialize[key].default as any)() : serialize[key].default;
					}
				}

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

export const columns = <S extends Serialize>(columns: S): S => {
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
	}, {} as any);
};
