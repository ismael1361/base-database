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
export type Datatype<T extends SerializeValueType> = T extends null ? "NULL" : T extends string ? "TEXT" : T extends bigint ? "BIGINT" : T extends number ? "INTEGER" | "FLOAT" : T extends boolean ? "BOOLEAN" : T extends Date ? "DATETIME" : "TEXT";
type SerializeItemProperties<T> = {
    type: T;
    primaryKey?: boolean;
    autoIncrement?: boolean;
    notNull?: boolean;
    default?: T;
    unique?: boolean;
    validate?: (value: T) => Error | void | undefined;
};
export type SerializeItemAny<T> = T extends {
    type: infer U;
} ? (U extends SerializeValueType ? SerializeItemProperties<U> : SerializeItemProperties<T>) : SerializeItemProperties<T>;
export type SerializeItem<T extends SerializeValueType> = SerializeItemAny<T>;
export type Serialize<T extends Record<PropertyKey, SerializeItem<SerializeValueType>> = Record<PropertyKey, SerializeItem<SerializeValueType>>> = {
    [k in keyof T]: SerializeItem<T[k]["type"]>;
};
export type SerializeDatatypeItem<V extends SerializeValueType, T extends OptionsDatatype = Datatype<V>> = SerializeItemAny<T>;
export type SerializeDatatype<S extends Serialize = never> = {
    [k in keyof S]: SerializeDatatypeItem<S[k]["type"]>;
};
export declare const Operators: {
    readonly EQUAL: "=";
    readonly NOT_EQUAL: "!=";
    readonly GREATER_THAN: ">";
    readonly LESS_THAN: "<";
    readonly GREATER_THAN_OR_EQUAL: ">=";
    readonly LESS_THAN_OR_EQUAL: "<=";
    readonly BETWEEN: "BETWEEN";
    readonly LIKE: "LIKE";
    readonly IN: "IN";
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
export declare const getDatatype: <T extends null | string | bigint | number | boolean | Date>(value: T) => Datatype<T>;
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
export declare const verifyDatatype: <T extends OptionsDatatype>(value: any, type: T) => value is T;
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
export declare const serializeData: <S extends Serialize>(serialize: SerializeDatatype<S>, data: Partial<Row<S>>, isPartial?: boolean) => Promise<Partial<Row<S>>>;
/**
 * Custom database class
 */
export declare abstract class Custom<db = never> {
    /**
     * If the database is disconnected
     */
    private _disconnected;
    /**
     * The database promise
     */
    readonly database: Promise<db>;
    /**
     * Create a custom database
     * @param database The database name
     */
    constructor(database: string);
    /**
     * If the database is disconnected
     */
    get disconnected(): boolean;
    /**
     * Set if the database is disconnected
     */
    set disconnected(value: boolean);
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
    ready<R = never>(callback?: (db: db) => R | Promise<R>): Promise<R>;
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
export declare class Table<S extends Serialize> {
    readonly custom: Custom<any>;
    private readonly name;
    /**
     * If the table is disconnected
     */
    private _disconnected;
    /**
     * The serialize datatype
     */
    private readonly serialize;
    /**
     * The initial promise
     */
    private readonly initialPromise;
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
    constructor(custom: Custom<any>, name: string, columns: S);
    /**
     * If the table is disconnected
     */
    disconnect(): Promise<void>;
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
    ready<R = never>(callback?: (table: Table<S>) => R | Promise<R>): Promise<R>;
    /**
     * Get the datatype of a column
     * @param key The column key
     * @returns The datatype
     * @example
     * table.getColumnType("id"); // "INTEGER"
     */
    getColumnType<C extends keyof S>(key: C): Datatype<S[C]["type"]>;
    /**
     * Get the columns
     * @returns The columns
     * @example
     * table.getColumns();
     */
    getColumns(): SerializeDatatype<S>;
    /**
     * Prepare a where clause
     * @param where The where clause
     * @returns The where clause
     * @example
     * table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 });
     */
    wheres<W extends keyof S>(...where: Wheres<S, W>): Wheres<S, W>;
    /**
     * Select all rows from the table
     * @param where The where clause
     * @param columns The columns to select
     * @returns The rows
     * @example
     * await table.selectAll(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
     */
    selectAll<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Array<Row<S, K>>>;
    /**
     * Select one row from the table
     * @param where The where clause
     * @param columns The columns to select
     * @returns The row
     * @example
     * await table.selectOne(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
     */
    selectOne<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Select the first row from the table
     * @param by The column to select
     * @param where The where clause
     * @param columns The columns to select
     * @returns The row
     * @example
     * await table.selectFirst("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
     */
    selectFirst<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Select the last row from the table
     * @param by The column to select
     * @param where The where clause
     * @param columns The columns to select
     * @returns The row
     * @example
     * await table.selectLast("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
     */
    selectLast<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Check if a row exists
     * @param where The where clause
     * @returns If the row exists
     * @example
     * await table.exists(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     */
    exists<W extends keyof S>(where: Wheres<S, W>): Promise<boolean>;
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
    insert(data: Partial<Row<S>>): Promise<void>;
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
    update<W extends keyof S>(data: Partial<Row<S>>, where: Wheres<S, W>): Promise<void>;
    /**
     * Delete rows from the table
     * @param where The where clause
     * @returns A promise
     * @example
     * await table.delete(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     */
    delete<W extends keyof S>(where: Wheres<S, W>): Promise<void>;
    /**
     * Get the length of the table
     * @param where The where clause
     * @returns The length
     * @example
     * await table.length(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     * await table.length();
     */
    length<W extends keyof S>(where?: Wheres<S, W>): Promise<number>;
}
/**
 * Define type for custom database constructor
 */
export type CustomConstructor<db = never> = new (database: string) => Custom<db>;
/**
 * Database class
 */
export declare class Database<db = never> {
    readonly database: string;
    /**
     * The custom database class
     */
    readonly custom: Custom<db>;
    /**
     * The tables
     */
    private tables;
    /**
     * Create a database
     * @param custom The custom database class
     * @param database The database name
     * @example
     * const database = new Database(CustomDatabase, "my-database");
     */
    constructor(custom: CustomConstructor<db>, database: string);
    /**
     * The database is ready
     * @param callback The callback
     * @returns The promise
     * @example
     * await database.ready(() => {
     *    // Code here will run when the database is ready
     * });
     */
    ready<R = void>(callback?: (db: Database<db>) => Promise<R>): Promise<R>;
    /**
     * Disconnect from the database
     * @example
     * await database.disconnect();
     */
    disconnect(): Promise<void>;
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
    forTable<S extends Serialize>(name: string, columns: S): Promise<Table<S>>;
    /**
     * Delete a table
     * @param name The table name
     * @returns A promise that resolves when the table is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteTable("my-table");
     */
    deleteTable(name: string): Promise<void>;
    /**
     * Delete the database
     * @returns A promise that resolves when the database is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteDatabase();
     */
    deleteDatabase(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map