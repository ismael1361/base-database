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
	validate?: (value: T) => Error | void | undefined;
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

export const Types = {
	TEXT: "",
	INTEGER: 0,
	FLOAT: 0.1,
	BOOLEAN: true,
	DATETIME: new Date(),
	BIGINT: BigInt(0),
	NULL: null,
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
export const getDatatype = <T extends null | string | bigint | number | boolean | Date>(value: T): Datatype<T> => {
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
export const verifyDatatype = <T extends OptionsDatatype>(value: any, type: T): value is T => {
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
export const serializeData = <S extends Serialize>(serialize: SerializeDatatype<S>, data: Partial<Row<S>>, isPartial: boolean = false): Promise<Partial<Row<S>>> => {
	return new Promise((resolve, reject) => {
		for (const key in isPartial ? data : serialize) {
			if (!(key in data)) {
				if (serialize[key].default !== undefined) {
					(data as any)[key] = serialize[key].default;
				} else if (!serialize[key].autoIncrement) {
					return reject(new Error(`Missing column ${key}`));
				}
			}
			if (serialize[key].autoIncrement) {
				delete data[key];
			} else {
				if (serialize[key].notNull && (data[key] === null || data[key] === undefined)) return reject(new Error(`Column ${key} cannot be null or undefined`));
				if (data[key] !== null && data[key] === undefined && !verifyDatatype(data[key], serialize[key].type)) return reject(new Error(`Invalid datatype for column ${key}`));

				if (data[key] !== null && data[key] === undefined && typeof serialize[key].validate === "function") {
					try {
						const isValid = serialize[key].validate(data[key]);
						if (isValid instanceof Error) return reject(isValid);
					} catch (e) {
						const message = "message" in (e as any) ? (e as any).message : "Invalid value, error thrown: " + String(e);
						return reject(new Error(message));
					}
				}
			}
		}

		resolve(data as any);
	});
};

/**
 * Custom database class
 */
export abstract class Custom<db = never> {
	/**
	 * If the database is disconnected
	 */
	private _disconnected: boolean = false;
	/**
	 * The database promise
	 */
	readonly database: Promise<db>;

	/**
	 * Create a custom database
	 * @param database The database name
	 */
	constructor(database: string) {
		this.database = this.connect(database);
	}

	/**
	 * If the database is disconnected
	 */
	get disconnected(): boolean {
		return this._disconnected;
	}

	/**
	 * Set if the database is disconnected
	 */
	set disconnected(value: boolean) {
		this._disconnected = value;
		if (value) this.disconnect();
	}

	/**
	 * The database is ready
	 * @param callback The callback
	 * @returns The promise
	 * @throws If the database is disconnected
	 * @example
	 * await custom.ready(() => {
	 *    // Code here will run when the database is ready
	 * });
	 */
	async ready<R = never>(callback?: (db: db) => R | Promise<R>): Promise<R> {
		if (this._disconnected) throw new Error("Database is disconnected");
		const db = await this.database;
		return callback ? await callback(db) : (undefined as any);
	}

	/**
	 * Connect to the database
	 * @param database The database name
	 * @returns The database
	 * @example
	 * await custom.connect("my-database");
	 */
	abstract connect(database: string): Promise<db>;

	/**
	 * Disconnect from the database
	 * @example
	 * await custom.disconnect();
	 */
	abstract disconnect(): Promise<void>;

	/**
	 * Select all rows from a table
	 * @param table The table name
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The rows
	 * @example
	 * await custom.selectAll("my-table", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectAll<C>(table: string, columns?: Array<C>, where?: Wheres): Promise<Array<Row>>;

	/**
	 * Select one row from a table
	 * @param table The table name
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectOne("my-table", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectOne<C>(table: string, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Select the first row from a table
	 * @param table The table name
	 * @param by The column to select
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectFirst("my-table", "id", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectFirst<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Select the last row from a table
	 * @param table The table name
	 * @param by The column to select
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectLast("my-table", "id", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectLast<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Insert a row into a table
	 * @param table The table name
	 * @param data The data to insert
	 * @example
	 * await custom.insert("my-table", { id: 123, name: "hello" });
	 */
	abstract insert(table: string, data: Row): Promise<void>;

	/**
	 * Update rows in a table
	 * @param table The table name
	 * @param data The data to update
	 * @param where The where clause
	 * @example
	 * await custom.update("my-table", { name: "world" }, [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract update(table: string, data: Partial<Row>, where: Wheres): Promise<void>;

	/**
	 * Delete rows from a table
	 * @param table The table name
	 * @param where The where clause
	 * @example
	 * await custom.delete("my-table", [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract delete(table: string, where: Wheres): Promise<void>;

	/**
	 * Get the length of a table
	 * @param table The table name
	 * @param where The where clause
	 * @returns The length
	 * @example
	 * await custom.length("my-table", [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract length(table: string, where?: Wheres): Promise<number>;

	/**
	 * Create a table
	 * @param table The table name
	 * @param columns The columns to create
	 * @example
	 * await custom.createTable("my-table", {
	 *     id: { type: "INTEGER", primaryKey: true },
	 *     name: { type: "TEXT", notNull: true },
	 * });
	 */
	abstract createTable(table: string, columns: SerializeDatatype<any>): Promise<void>;

	/**
	 * Delete a table
	 * @param table The table name
	 * @example
	 * await custom.deleteTable("my-table");
	 */
	abstract deleteTable(table: string): Promise<void>;

	/**
	 * Delete the database
	 * @example
	 * await custom.deleteDatabase();
	 */
	abstract deleteDatabase(): Promise<void>;
}

/**
 * Table class
 */
export class Table<S extends Serialize> {
	/**
	 * If the table is disconnected
	 */
	private _disconnected: boolean = false;
	/**
	 * The serialize datatype
	 */
	private readonly serialize: SerializeDatatype<S>;
	/**
	 * The initial promise
	 */
	private readonly initialPromise: Promise<void>;

	/**
	 * Create a table
	 * @param custom The custom database class
	 * @param name The table name
	 * @param columns The columns
	 * @example
	 * const table = new Table(custom, "my-table", {
	 *    id: { type: Database.Types.INTEGER, primaryKey: true },
	 *    name: { type: Database.Types.TEXT, notNull: true },
	 *    date: { type: Database.Types.DATETIME },
	 * });
	 * table.selectAll();
	 * table.insert({ id: 123, name: "hello" });
	 * table.update({ name: "world" }, [{ column: "id", operator: "=", value: 123 }]);
	 * table.delete([{ column: "id", operator: "=", value: 123 }]);
	 */
	constructor(readonly custom: Custom<any>, private readonly name: string, columns: S) {
		this.serialize = Object.keys(columns).reduce((acc, key) => {
			acc[key] = {
				type: getDatatype(columns[key].type),
				primaryKey: columns[key].primaryKey ?? false,
				autoIncrement: columns[key].autoIncrement ?? false,
				notNull: columns[key].notNull ?? false,
				default: columns[key].default,
				unique: columns[key].unique ?? false,
			};
			return acc;
		}, {} as any);

		this.initialPromise = this.custom.createTable(name, this.serialize);
	}

	/**
	 * If the table is disconnected
	 */
	async disconnect(): Promise<void> {
		this._disconnected = true;
	}

	/**
	 * The table is ready
	 * @param callback The callback
	 * @returns The promise
	 * @throws If the database is disconnected
	 * @example
	 * await table.ready((table) => {
	 *    // Code here will run when the table is ready
	 * });
	 */
	async ready<R = never>(callback?: (table: Table<S>) => R | Promise<R>): Promise<R> {
		if (this._disconnected) throw new Error("Database is disconnected");
		await this.initialPromise;
		return callback ? await callback(this) : (undefined as any);
	}

	/**
	 * Get the datatype of a column
	 * @param key The column key
	 * @returns The datatype
	 * @example
	 * table.getColumnType("id"); // "INTEGER"
	 */
	getColumnType<C extends keyof S>(key: C): Datatype<S[C]["type"]> {
		return this.serialize[key].type as any;
	}

	/**
	 * Get the columns
	 * @returns The columns
	 * @example
	 * table.getColumns();
	 */
	getColumns(): SerializeDatatype<S> {
		return this.serialize;
	}

	/**
	 * Prepare a where clause
	 * @param where The where clause
	 * @returns The where clause
	 * @example
	 * table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 });
	 */
	wheres<W extends keyof S>(...where: Wheres<S, W>): Wheres<S, W> {
		return where;
	}

	/**
	 * Select all rows from the table
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The rows
	 * @example
	 * await table.selectAll(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectAll<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Array<Row<S, K>>> {
		return this.ready(() => this.custom.selectAll<K>(this.name, columns, where as any));
	}

	/**
	 * Select one row from the table
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectOne(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectOne<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectOne<K>(this.name, columns, where as any));
	}

	/**
	 * Select the first row from the table
	 * @param by The column to select
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectFirst("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectFirst<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectFirst<K>(this.name, by, columns, where as any));
	}

	/**
	 * Select the last row from the table
	 * @param by The column to select
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectLast("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectLast<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectLast<K>(this.name, by, columns, where as any));
	}

	/**
	 * Check if a row exists
	 * @param where The where clause
	 * @returns If the row exists
	 * @example
	 * await table.exists(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	exists<W extends keyof S>(where: Wheres<S, W>): Promise<boolean> {
		return this.ready(async () => {
			const data = await this.custom.selectOne(this.name, undefined, where as any);
			return data !== null;
		});
	}

	/**
	 * Insert a row into the table
	 * @param data The data to insert
	 * @returns A promise
	 * @throws If a column is missing
	 * @throws If a column is null and not nullable
	 * @throws If a column has an invalid datatype
	 * @example
	 * await table.insert({ id: 123, name: "hello" });
	 */
	async insert(data: Partial<Row<S>>): Promise<void> {
		data = await serializeData(this.serialize, data);
		return this.ready(() => this.custom.insert(this.name, data));
	}

	/**
	 * Update rows in the table
	 * @param data The data to update
	 * @param where The where clause
	 * @returns A promise
	 * @throws If a column is null and not nullable
	 * @throws If a column has an invalid datatype
	 * @example
	 * await table.update({ name: "world" }, table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	async update<W extends keyof S>(data: Partial<Row<S>>, where: Wheres<S, W>): Promise<void> {
		data = await serializeData(this.serialize, data, true);
		return this.ready(() => this.custom.update(this.name, data, where as any));
	}

	/**
	 * Delete rows from the table
	 * @param where The where clause
	 * @returns A promise
	 * @example
	 * await table.delete(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	delete<W extends keyof S>(where: Wheres<S, W>): Promise<void> {
		return this.ready(() => this.custom.delete(this.name, where as any));
	}

	/**
	 * Get the length of the table
	 * @param where The where clause
	 * @returns The length
	 * @example
	 * await table.length(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 * await table.length();
	 */
	length<W extends keyof S>(where?: Wheres<S, W>): Promise<number> {
		return this.ready(() => this.custom.length(this.name, where as any));
	}
}

/**
 * Define type for custom database constructor
 */
export type CustomConstructor<db = never> = new (database: string) => Custom<db>;

/**
 * Database class
 */
export class Database<db = never> {
	/**
	 * The custom database class
	 */
	readonly custom: Custom<db>;
	/**
	 * The tables
	 */
	private tables: Map<string, Table<any>> = new Map();

	/**
	 * Create a database
	 * @param custom The custom database class
	 * @param database The database name
	 * @example
	 * const database = new Database(CustomDatabase, "my-database");
	 */
	constructor(custom: CustomConstructor<db>, readonly database: string) {
		this.custom = new custom(database);
	}

	/**
	 * The database is ready
	 * @param callback The callback
	 * @returns The promise
	 * @example
	 * await database.ready(() => {
	 *    // Code here will run when the database is ready
	 * });
	 */
	async ready<R = void>(callback?: (db: Database<db>) => Promise<R>): Promise<R> {
		return this.custom.ready(() => callback?.(this) ?? Promise.resolve(undefined as any));
	}

	/**
	 * Disconnect from the database
	 * @example
	 * await database.disconnect();
	 */
	async disconnect(): Promise<void> {
		this.custom.disconnected = true;
		this.tables.forEach((table) => table.disconnect());
		this.tables.clear();
	}

	/**
	 * Get a table
	 * @param name The table name
	 * @param columns The columns
	 * @returns The table
	 * @example
	 * const table = await database.forTable("my-table", {
	 *    id: { type: Database.Types.INTEGER, primaryKey: true },
	 *    name: { type: Database.Types.TEXT, notNull: true },
	 *    date: { type: Database.Types.DATETIME },
	 * });
	 */
	forTable<S extends Serialize>(name: string, columns: S): Promise<Table<S>> {
		return this.ready(() => {
			if (this.custom.disconnected) throw new Error("Database is disconnected");

			let table = this.tables.get(name);
			if (!table) {
				table = new Table(this.custom, name, columns);
				this.tables.set(name, table);
			}
			return Promise.resolve(table as Table<S>);
		});
	}

	/**
	 * Delete a table
	 * @param name The table name
	 * @returns A promise that resolves when the table is deleted
	 * @throws If the database is disconnected
	 * @example
	 * await database.deleteTable("my-table");
	 */
	deleteTable(name: string): Promise<void> {
		return this.ready(async () => {
			if (this.custom.disconnected) throw new Error("Database is disconnected");
			await this.custom.deleteTable(name);
			this.tables.delete(name);
		});
	}

	/**
	 * Delete the database
	 * @returns A promise that resolves when the database is deleted
	 * @throws If the database is disconnected
	 * @example
	 * await database.deleteDatabase();
	 */
	deleteDatabase(): Promise<void> {
		return this.ready(async () => {
			if (this.custom.disconnected) throw new Error("Database is disconnected");
			this.custom.disconnected = true;
			await this.custom.deleteDatabase();
			this.tables.forEach((table) => table.disconnect());
			this.tables.clear();
		});
	}
}
