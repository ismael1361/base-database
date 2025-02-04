import type { Table } from "./Table";
export type IsLiteral<T> = T extends object ? (T extends Function | Date | Array<any> | {
    new (...args: any[]): any;
} ? never : T) : never;
export type Operator = "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "NOT BETWEEN" | "LIKE" | "NOT LIKE" | "IN" | "NOT IN";
export type WheresItem<T extends TableType, K extends keyof T> = {
    column: K;
    operator: Operator;
    compare: T[K];
};
export type Wheres<T extends TableType = any, K extends keyof T = never> = Array<WheresItem<T, K>>;
export type WheresCompareType<T extends SerializeValueType, O extends Operator> = O extends "=" | "!=" | ">" | "<" | ">=" | "<=" ? T : O extends "BETWEEN" | "NOT BETWEEN" ? [T, T] : O extends "LIKE" | "NOT LIKE" ? string | RegExp : O extends "IN" | "NOT IN" ? Array<T> : never;
export interface QueryOptions<S extends TableType = any> {
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
export interface TableType {
    [key: PropertyKey]: SerializeValueType;
}
export type Row<T extends TableType = any, K extends keyof T = keyof T> = {
    [k in K]: T[k];
} & {
    rowid: number;
};
export type DataType<T extends SerializeValueType> = T extends null ? "NULL" : T extends string ? "TEXT" : T extends bigint ? "BIGINT" : T extends number ? "INTEGER" | "FLOAT" : T extends boolean ? "BOOLEAN" : T extends Date ? "DATETIME" : "TEXT";
export type DataValueType<T extends OptionsDataType> = T extends "NULL" ? null : T extends "TEXT" ? string : T extends "BIGINT" ? bigint : T extends "INTEGER" | "FLOAT" ? number : T extends "BOOLEAN" ? boolean : T extends "DATETIME" ? Date : never;
export type SerializeValueDefault<T> = T extends OptionsDataType ? DataValueType<T> : T extends undefined ? never : T;
type TypedOptions<T> = T extends {
    type: OptionsDataType;
    options: (infer O)[];
} ? T extends {
    type: "TEXT";
    options: O[];
} ? Omit<T, "type" | "default"> & {
    type: O;
    default: O | (() => O);
} : T : T extends {
    type: string;
    options: (infer O)[];
} ? Omit<T, "type" | "default"> & {
    type: O;
    default: O | (() => O);
} : T;
export type SerializeItemProperties<T> = TypedOptions<{
    type: SerializeValueDefault<T>;
    primaryKey?: true | false;
    autoIncrement?: true | false;
    notNull?: true | false;
    default?: SerializeValueDefault<T> | (() => SerializeValueDefault<T>);
    unique?: true | false;
    check?: (value: T) => Error | void | undefined;
    options?: SerializeValueDefault<T> extends string ? Array<string> : never;
}>;
export type SerializeItemAny<T> = T extends SerializeItemProperties<infer V> ? SerializeItemProperties<V> : T extends {
    type: infer U;
} ? U extends OptionsDataType ? SerializeItemProperties<DataValueType<U>> : U extends SerializeValueType ? SerializeItemProperties<U> : SerializeItemProperties<T> : SerializeItemProperties<T>;
export type SerializeItem<T extends SerializeValueType = SerializeValueType> = SerializeItemAny<T>;
export type Serialize<T extends TableType> = {
    [k in keyof T]: TypedOptions<SerializeItem<T[k]>>;
};
export type SerializeDataTypeItem<V extends SerializeValueType, T extends OptionsDataType = DataType<V>> = SerializeItemAny<T>;
export type SerializeDataType<T extends TableType = never> = {
    [k in keyof T]: TypedOptions<SerializeDataTypeItem<T[k]>>;
};
export type NormalizeSerialize<T extends TableType> = {
    [k in keyof T]: TypedOptions<T[k]>;
};
export type CreatorFunction<T extends TableType, O = Row<T>> = (row: Row<T>) => O extends SerializableClassType<T> ? InstanceType<O> : Row<T>;
export type SerializerFunction<T extends TableType> = (obj: any) => Partial<Row<T>>;
export type SerializableClassType<T extends TableType> = {
    new (...args: any): any;
    create?(snap: Row<T>): any;
};
export interface TypeSchemaOptions<T extends TableType, O = Row<T>> {
    serializer?: string | SerializerFunction<T>;
    creator?: string | CreatorFunction<T, O>;
}
export interface TableSchema<T extends TableType, O = Row<T>> {
    schema: O;
    creator: CreatorFunction<T, O>;
    serializer: SerializerFunction<T>;
    deserialize<K extends keyof T>(row: Row<T>): RowDeserialize<T, O, K>;
    serialize(obj: any): Partial<Row<T>>;
}
export type RowDeserialize<T extends TableType, O = Row<T>, K extends keyof T = keyof T> = O extends SerializableClassType<T> ? InstanceType<O> : Row<T, K> & Record<K, unknown>;
export type RowSerialize<T extends TableType, O = Row<T>> = O extends SerializableClassType<T> ? InstanceType<O> : Partial<Row<T> & Record<keyof T, unknown>>;
export interface TableReady<T extends TableType, O = Row<T>> {
    table: Promise<Table<T, O>>;
    ready<R = void>(callback: (table: Table<T, O>) => R | Promise<R>): Promise<R>;
    query(): ReturnType<Table<T, O>["query"]>;
    insert: Table<T, O>["insert"];
    selectAll(): ReturnType<Table<T, O>["selectAll"]>;
    selectOne(): ReturnType<Table<T, O>["selectOne"]>;
    selectFirst(): ReturnType<Table<T, O>["selectFirst"]>;
    selectLast(): ReturnType<Table<T, O>["selectLast"]>;
    length(): ReturnType<Table<T, O>["length"]>;
    on: Table<T, O>["on"];
    once: Table<T, O>["once"];
    off(...args: Parameters<Table<T, O>["off"]>): void;
    offOnce(...args: Parameters<Table<T, O>["offOnce"]>): void;
    schema<O extends SerializableClassType<T>>(schema: O, options?: TypeSchemaOptions<T, O>): TableReady<T, O>;
}
export type ExtractTableRow<T extends TableReady<any, any> | Table<any, any> | Promise<Table<any, any>> | Promise<Table<any, any> | undefined> | Row<any> | Serialize<any>> = T extends TableReady<infer U, any> ? Row<U> : T extends Table<infer U, any> ? Row<U> : T extends Promise<Table<infer U, any>> ? Row<U> : T extends Promise<Table<infer U, any> | undefined> ? Row<U> : T extends Row<infer U> ? Row<U> : T extends Serialize<infer U> ? Row<U> : never;
export {};
//# sourceMappingURL=Types.d.ts.map