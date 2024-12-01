export type WheresItem<C extends Serialize, K extends keyof C> = {
	column: K;
	operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "BETWEEN" | "LIKE" | "IN";
	value: C[K]["type"];
};

export type Wheres<C extends Serialize = any, K extends keyof C = never> = Array<WheresItem<C, K>>;

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
	default?: T;
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
