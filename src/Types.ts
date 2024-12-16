import type { Query } from "Query";
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
	order: Array<{ column: keyof S; ascending: boolean }>;
	columns: Array<keyof S>;
}

export type OptionsDatatype = "TEXT" | "INTEGER" | "FLOAT" | "BOOLEAN" | "DATETIME" | "BIGINT" | "NULL";

export type SerializeValueType = null | string | bigint | number | boolean | Date;

export type Row<C extends Serialize = any, K extends string | number | symbol = keyof C> = {
	[k in K]: C[k]["type"];
};

export type Datatype<T extends SerializeValueType> = T extends null
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

type SerializeItemProperties<T> = {
	type: T;
	primaryKey?: boolean;
	autoIncrement?: boolean;
	notNull?: boolean;
	default?: T | (() => T);
	unique?: boolean;
	check?: (value: T) => Error | void | undefined;
};

export type SerializeItemAny<T> = T extends { type: infer U } ? (U extends SerializeValueType ? SerializeItemProperties<U> : SerializeItemProperties<T>) : SerializeItemProperties<T>;

export type SerializeItem<T extends SerializeValueType> = SerializeItemAny<T>;

export type Serialize<T extends Record<PropertyKey, SerializeItem<SerializeValueType>> = Record<PropertyKey, SerializeItem<SerializeValueType>>> = {
	[k in keyof T]: SerializeItem<T[k]["type"]>;
};

export type SerializeDatatypeItem<V extends SerializeValueType, T extends OptionsDatatype = Datatype<V>> = SerializeItemAny<T>;

export type SerializeDatatype<S extends Serialize = never> = {
	[k in keyof S]: SerializeDatatypeItem<S[k]["type"]>;
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

export type ExtractTableRow<T extends TableReady<any> | Table<any> | Promise<Table<any>> | Promise<Table<any> | undefined> | Row<any> | Serialize<any>> = T extends TableReady<infer U>
	? Row<U>
	: T extends Table<infer U>
	? Row<U>
	: T extends Promise<Table<infer U>>
	? Row<U>
	: T extends Promise<Table<infer U> | undefined>
	? Row<U>
	: T extends Row<infer U>
	? Row<U>
	: T extends Serialize<infer U>
	? Row<U>
	: never;
