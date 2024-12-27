import type { Table } from "./Table";

export type IsLiteral<T> = T extends object ? (T extends Function | Date | Array<any> | { new (...args: any[]): any } ? never : T) : never;

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
	order: Array<{ column: keyof S; ascending: boolean }>;
	columns: Array<keyof S>;
}

export type OptionsDataType = "TEXT" | "INTEGER" | "FLOAT" | "BOOLEAN" | "DATETIME" | "BIGINT" | "NULL";

export type SerializeValueType = null | string | bigint | number | boolean | Date;

export type Row<C extends Serialize = any, K extends keyof C = keyof C> = {
	[k in K]: C[k]["options"] extends Array<infer O> ? O : C[k]["type"];
};

export type DataType<T extends SerializeValueType> = T extends null
	? "NULL"
	: T extends string
	? "TEXT"
	: T extends bigint
	? "BIGINT"
	: T extends number
	? "INTEGER" | "FLOAT"
	: T extends boolean
	? "BOOLEAN"
	: T extends Date
	? "DATETIME"
	: "TEXT";

export type DataValueType<T extends OptionsDataType> = T extends "NULL"
	? null
	: T extends "TEXT"
	? string
	: T extends "BIGINT"
	? bigint
	: T extends "INTEGER" | "FLOAT"
	? number
	: T extends "BOOLEAN"
	? boolean
	: T extends "DATETIME"
	? Date
	: never;

export type SerializeValueDefault<T> = T extends OptionsDataType ? DataValueType<T> : T;

type TypedOptions<T> = T extends { type: string; options: (infer O)[] } ? Omit<T, "type" | "default"> & { type: O; default: O | (() => O) } : T;

type SerializeItemProperties<T> = TypedOptions<{
	type: SerializeValueDefault<T>;
	primaryKey?: true | false;
	autoIncrement?: true | false;
	notNull?: true | false;
	default?: SerializeValueDefault<T> | (() => SerializeValueDefault<T>);
	unique?: true | false;
	check?: (value: T) => Error | void | undefined;
	options?: SerializeValueDefault<T> extends string ? Array<string> : never;
}>;

export type SerializeItemAny<T> = T extends { type: infer U }
	? U extends OptionsDataType
		? SerializeItemProperties<DataValueType<U>>
		: U extends SerializeValueType
		? SerializeItemProperties<U>
		: SerializeItemProperties<T>
	: SerializeItemProperties<T>;

export type SerializeItem<T extends SerializeValueType> = SerializeItemAny<T>;

export type Serialize<T extends Record<PropertyKey, SerializeItem<SerializeValueType>> = Record<PropertyKey, SerializeItem<SerializeValueType>>> = {
	[k in keyof T]: SerializeItem<T[k]["type"]>;
};

export type SerializeDataTypeItem<V extends SerializeValueType, T extends OptionsDataType = DataType<V>> = SerializeItemAny<T>;

export type SerializeDataType<S extends Serialize = never> = {
	[k in keyof S]: SerializeDataTypeItem<S[k]["type"]>;
};

export type CreatorFunction<S extends Serialize, O = Row<S>> = (row: Row<S>) => O extends SerializableClassType<S> ? InstanceType<O> : Row<S>;
export type SerializerFunction<S extends Serialize> = (obj: any) => Partial<Row<S>>;

export type SerializableClassType<S extends Serialize> = {
	new (...args: any): any;
	create?(snap: Row<S>): any;
};

export interface TypeSchemaOptions<S extends Serialize, O = Row<S>> {
	serializer?: string | SerializerFunction<S>;
	creator?: string | CreatorFunction<S, O>;
}

export interface TableSchema<S extends Serialize, O = Row<S>> {
	schema: O;
	creator: CreatorFunction<S, O>;
	serializer: SerializerFunction<S>;
	deserialize<K extends keyof S>(row: Row<S>): RowDeserialize<S, O, K>;
	serialize(obj: any): Partial<Row<S>>;
}

export type RowDeserialize<S extends Serialize, O = Row<S>, K extends keyof S = keyof S> = O extends SerializableClassType<S> ? InstanceType<O> : Row<S, K> & Record<K, unknown>;

export type RowSerialize<S extends Serialize, O = Row<S>> = O extends SerializableClassType<S> ? InstanceType<O> : Partial<Row<S> & Record<keyof S, unknown>>;

export interface TableReady<S extends Serialize, O = Row<S>> {
	table: Promise<Table<S, O>>;
	ready<T = void>(callback: (table: Table<S, O>) => T | Promise<T>): Promise<T>;
	query(): ReturnType<Table<S, O>["query"]>;
	insert(...args: Parameters<Table<S, O>["insert"]>): ReturnType<Table<S, O>["insert"]>;
	selectAll(): ReturnType<Table<S, O>["selectAll"]>;
	selectOne(): ReturnType<Table<S, O>["selectOne"]>;
	selectFirst(): ReturnType<Table<S, O>["selectFirst"]>;
	selectLast(): ReturnType<Table<S, O>["selectLast"]>;
	length(): ReturnType<Table<S, O>["length"]>;
	on: Table<S, O>["on"];
	once: Table<S, O>["once"];
	off(...args: Parameters<Table<S, O>["off"]>): void;
	offOnce(...args: Parameters<Table<S, O>["offOnce"]>): void;
	schema<O extends SerializableClassType<S>>(schema: O, options?: TypeSchemaOptions<S, O>): TableReady<S, O>;
}

export type ExtractTableRow<T extends TableReady<any, any> | Table<any, any> | Promise<Table<any, any>> | Promise<Table<any, any> | undefined> | Row<any> | Serialize<any>> = T extends TableReady<
	infer U,
	any
>
	? Row<U>
	: T extends Table<infer U, any>
	? Row<U>
	: T extends Promise<Table<infer U, any>>
	? Row<U>
	: T extends Promise<Table<infer U, any> | undefined>
	? Row<U>
	: T extends Row<infer U>
	? Row<U>
	: T extends Serialize<infer U>
	? Row<U>
	: never;
