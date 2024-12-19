import type { Table } from "./Table";
export type Operator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";
export type WheresItem<C extends Serialize, K extends keyof C> = {
    column: K;
    operator: Operator;
    compare: C[K]["type"];
};
export type Wheres<C extends Serialize = any, K extends keyof C = never> = Array<WheresItem<C, K>>;
export interface QueryOptions<S extends Serialize = any> {
    wheres: Wheres<S, any>;
    skip?: number;
    take?: number;
    order: Array<{
        column: keyof S;
        ascending: boolean;
    }>;
    columns: Array<keyof S>;
}
export type OptionsDataType = "TEXT" | "INTEGER" | "FLOAT" | "BOOLEAN" | "DATETIME" | "BIGINT" | "NULL";
export type SerializeValueType = null | string | bigint | number | boolean | Date;
export type Row<C extends Serialize = any, K extends keyof C = keyof C> = {
    [k in K]: C[k]["type"];
};
export type DataType<T extends SerializeValueType> = T extends null ? "NULL" : T extends string ? "TEXT" : T extends bigint ? "BIGINT" : T extends number ? "INTEGER" | "FLOAT" : T extends boolean ? "BOOLEAN" : T extends Date ? "DATETIME" : "TEXT";
export type DataValueType<T extends OptionsDataType> = T extends "NULL" ? null : T extends "TEXT" ? string : T extends "BIGINT" ? bigint : T extends "INTEGER" | "FLOAT" ? number : T extends "BOOLEAN" ? boolean : T extends "DATETIME" ? Date : never;
export type SerializeValueDefault<T> = T extends OptionsDataType ? DataValueType<T> : T;
type SerializeItemProperties<T> = {
    type: T;
    primaryKey?: true | false;
    autoIncrement?: true | false;
    notNull?: true | false;
    default?: SerializeValueDefault<T> | (() => SerializeValueDefault<T>);
    unique?: true | false;
    check?: (value: T) => Error | void | undefined;
};
export type SerializeItemAny<T> = T extends {
    type: infer U;
} ? U extends OptionsDataType ? SerializeItemProperties<DataValueType<U>> : U extends SerializeValueType ? SerializeItemProperties<U> : SerializeItemProperties<T> : SerializeItemProperties<T>;
export type SerializeItem<T extends SerializeValueType> = SerializeItemAny<T>;
export type Serialize<T extends Record<PropertyKey, SerializeItem<SerializeValueType>> = Record<PropertyKey, SerializeItem<SerializeValueType>>> = {
    [k in keyof T]: SerializeItem<T[k]["type"]>;
};
export type SerializeDataTypeItem<V extends SerializeValueType, T extends OptionsDataType = DataType<V>> = SerializeItemAny<T>;
export type SerializeDataType<S extends Serialize = never> = {
    [k in keyof S]: SerializeDataTypeItem<S[k]["type"]>;
};
export interface TableReady<S extends Serialize> {
    table: Promise<Table<S> | undefined>;
    ready<T = void>(callback: (table: Table<S>) => T | Promise<T>): Promise<T>;
    query(): ReturnType<Table<S>["query"]>;
    insert(...args: Parameters<Table<S>["insert"]>): Promise<void>;
    on: Table<S>["on"];
    once: Table<S>["once"];
    off(...args: Parameters<Table<S>["off"]>): void;
    offOnce(...args: Parameters<Table<S>["offOnce"]>): void;
}
export type ExtractTableRow<T extends TableReady<any> | Table<any> | Promise<Table<any>> | Promise<Table<any> | undefined> | Row<any> | Serialize<any>> = T extends TableReady<infer U> ? Row<U> : T extends Table<infer U> ? Row<U> : T extends Promise<Table<infer U>> ? Row<U> : T extends Promise<Table<infer U> | undefined> ? Row<U> : T extends Row<infer U> ? Row<U> : T extends Serialize<infer U> ? Row<U> : never;
export {};
//# sourceMappingURL=Types.d.ts.map