import { DataType, OptionsDataType, Row, Serialize, SerializeDataType } from "./Types";
export declare const Operators: {
    readonly EQUAL: "=";
    readonly NOT_EQUAL: "!=";
    readonly GREATER_THAN: ">";
    readonly LESS_THAN: "<";
    readonly GREATER_THAN_OR_EQUAL: ">=";
    readonly LESS_THAN_OR_EQUAL: "<=";
    readonly BETWEEN: "BETWEEN";
    readonly NOT_BETWEEN: "NOT BETWEEN";
    readonly LIKE: "LIKE";
    readonly NOT_LIKE: "NOT LIKE";
    readonly IN: "IN";
    readonly NOT_IN: "NOT IN";
};
export declare const Types: {
    TEXT: string;
    INTEGER: number;
    FLOAT: number;
    BOOLEAN: boolean;
    DATETIME: Date;
    BIGINT: bigint;
    NULL: null;
};
export declare const generateUUID: (separator?: string, version?: "v4" | "v7") => string;
export declare const columns: <S extends Serialize>(columns: S) => S;
export declare const isLiteralObject: (obj: any) => boolean;
export declare const cloneObject: <T>(obj: T) => T;
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
export declare const getDatatype: <T extends null | string | bigint | number | boolean | Date>(value: T) => DataType<T>;
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
export declare const verifyDatatype: <T extends OptionsDataType>(value: any, type: T) => value is T;
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
export declare const serializeDataForSet: <S extends Serialize, P extends boolean = false>(serialize: SerializeDataType<S>, data: Partial<Row<S>>, isPartial?: P) => Promise<P extends true ? Partial<Row<S>> : Row<S>>;
export declare const serializeDataForGet: <S extends Serialize, D extends Partial<Row<S>> | Array<Partial<Row<S>>>>(serialize: SerializeDataType<S>, data: D) => Promise<D extends Array<Partial<Row<S>>> ? Array<Row<S>> : Row<S>>;
//# sourceMappingURL=Utils.d.ts.map