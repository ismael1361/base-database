"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.Table = exports.Custom = exports.serializeData = exports.verifyDatatype = exports.getDatatype = exports.Types = exports.Operators = void 0;
exports.Operators = {
    EQUAL: "=",
    NOT_EQUAL: "!=",
    GREATER_THAN: ">",
    LESS_THAN: "<",
    GREATER_THAN_OR_EQUAL: ">=",
    LESS_THAN_OR_EQUAL: "<=",
    BETWEEN: "BETWEEN",
    LIKE: "LIKE",
    IN: "IN",
};
exports.Types = {
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
const getDatatype = (value) => {
    if (value === null)
        return "NULL";
    if (typeof value === "string")
        return "TEXT";
    if (typeof value === "bigint")
        return "BIGINT";
    if (typeof value === "number")
        return parseInt(value.toString()).toString() === value.toString() ? "INTEGER" : "FLOAT";
    if (typeof value === "boolean")
        return "BOOLEAN";
    if (value instanceof Date)
        return "DATETIME";
    return "TEXT";
};
exports.getDatatype = getDatatype;
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
const verifyDatatype = (value, type) => {
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
exports.verifyDatatype = verifyDatatype;
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
const serializeData = (serialize, data, isPartial = false) => {
    return new Promise((resolve, reject) => {
        for (const key in isPartial ? data : serialize) {
            if (!(key in data)) {
                if (serialize[key].default !== undefined) {
                    data[key] = serialize[key].default;
                }
                else if (!serialize[key].autoIncrement) {
                    return reject(new Error(`Missing column ${key}`));
                }
            }
            if (serialize[key].autoIncrement) {
                delete data[key];
            }
            else {
                if (serialize[key].notNull && (data[key] === null || data[key] === undefined))
                    return reject(new Error(`Column ${key} cannot be null or undefined`));
                if (data[key] !== null && data[key] !== undefined && !(0, exports.verifyDatatype)(data[key], serialize[key].type))
                    return reject(new Error(`Invalid datatype for column ${key}`));
                if (data[key] !== null && data[key] !== undefined && typeof serialize[key].check === "function") {
                    try {
                        const isValid = serialize[key].check(data[key]);
                        if (isValid instanceof Error)
                            return reject(isValid);
                    }
                    catch (e) {
                        const message = "message" in e ? e.message : "Invalid value, error thrown: " + String(e);
                        return reject(new Error(message));
                    }
                }
            }
        }
        resolve(data);
    });
};
exports.serializeData = serializeData;
/**
 * Custom database class
 */
class Custom {
    /**
     * If the database is disconnected
     */
    _disconnected = false;
    /**
     * The database promise
     */
    database;
    /**
     * Create a custom database
     * @param database The database name
     */
    constructor(database) {
        this.database = this.connect(database);
    }
    /**
     * If the database is disconnected
     */
    get disconnected() {
        return this._disconnected;
    }
    /**
     * Set if the database is disconnected
     */
    set disconnected(value) {
        this._disconnected = value;
        if (value)
            this.disconnect();
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
    async ready(callback) {
        if (this._disconnected)
            throw new Error("Database is disconnected");
        const db = await this.database;
        return callback ? await callback(db) : undefined;
    }
}
exports.Custom = Custom;
/**
 * Table class
 */
class Table {
    custom;
    name;
    /**
     * If the table is disconnected
     */
    _disconnected = false;
    /**
     * The serialize datatype
     */
    serialize;
    /**
     * The initial promise
     */
    initialPromise;
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
    constructor(custom, name, columns) {
        this.custom = custom;
        this.name = name;
        this.serialize = Object.keys(columns).reduce((acc, key) => {
            acc[key] = {
                type: (0, exports.getDatatype)(columns[key].type),
                primaryKey: columns[key].primaryKey ?? false,
                autoIncrement: columns[key].autoIncrement ?? false,
                notNull: columns[key].notNull ?? false,
                default: columns[key].default,
                unique: columns[key].unique ?? false,
                check: columns[key].check,
            };
            return acc;
        }, {});
        this.initialPromise = this.custom.createTable(name, this.serialize);
    }
    /**
     * If the table is disconnected
     */
    async disconnect() {
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
    async ready(callback) {
        if (this._disconnected)
            throw new Error("Database is disconnected");
        await this.initialPromise;
        return callback ? await callback(this) : undefined;
    }
    /**
     * Get the datatype of a column
     * @param key The column key
     * @returns The datatype
     * @example
     * table.getColumnType("id"); // "INTEGER"
     */
    getColumnType(key) {
        return this.serialize[key].type;
    }
    /**
     * Get the columns
     * @returns The columns
     * @example
     * table.getColumns();
     */
    getColumns() {
        return this.serialize;
    }
    /**
     * Prepare a where clause
     * @param where The where clause
     * @returns The where clause
     * @example
     * table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 });
     */
    wheres(...where) {
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
    selectAll(where, columns) {
        return this.ready(() => this.custom.selectAll(this.name, columns, where));
    }
    /**
     * Select one row from the table
     * @param where The where clause
     * @param columns The columns to select
     * @returns The row
     * @example
     * await table.selectOne(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
     */
    selectOne(where, columns) {
        return this.ready(() => this.custom.selectOne(this.name, columns, where));
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
    selectFirst(by, where, columns) {
        return this.ready(() => this.custom.selectFirst(this.name, by, columns, where));
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
    selectLast(by, where, columns) {
        return this.ready(() => this.custom.selectLast(this.name, by, columns, where));
    }
    /**
     * Check if a row exists
     * @param where The where clause
     * @returns If the row exists
     * @example
     * await table.exists(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     */
    exists(where) {
        return this.ready(async () => {
            const data = await this.custom.selectOne(this.name, undefined, where);
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
    async insert(data) {
        data = await (0, exports.serializeData)(this.serialize, data);
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
    async update(data, where) {
        data = await (0, exports.serializeData)(this.serialize, data, true);
        return this.ready(() => this.custom.update(this.name, data, where));
    }
    /**
     * Delete rows from the table
     * @param where The where clause
     * @returns A promise
     * @example
     * await table.delete(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     */
    delete(where) {
        return this.ready(() => this.custom.delete(this.name, where));
    }
    /**
     * Get the length of the table
     * @param where The where clause
     * @returns The length
     * @example
     * await table.length(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     * await table.length();
     */
    length(where) {
        return this.ready(() => this.custom.length(this.name, where));
    }
}
exports.Table = Table;
/**
 * Database class
 */
class Database {
    database;
    /**
     * The custom database class
     */
    custom;
    /**
     * The tables
     */
    tables = new Map();
    /**
     * Create a database
     * @param custom The custom database class
     * @param database The database name
     * @example
     * const database = new Database(CustomDatabase, "my-database");
     */
    constructor(custom, database) {
        this.database = database;
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
    async ready(callback) {
        return this.custom.ready(() => callback?.(this) ?? Promise.resolve(undefined));
    }
    /**
     * Disconnect from the database
     * @example
     * await database.disconnect();
     */
    async disconnect() {
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
    forTable(name, columns) {
        return this.ready(() => {
            if (this.custom.disconnected)
                throw new Error("Database is disconnected");
            let table = this.tables.get(name);
            if (!table) {
                table = new Table(this.custom, name, columns);
                this.tables.set(name, table);
            }
            return Promise.resolve(table);
        });
    }
    readyTable(name, columns) {
        const table = typeof name === "string" && this.tables.has(name)
            ? Promise.resolve(this.tables.get(name))
            : typeof name === "string" && columns
                ? this.forTable(name, columns)
                : name instanceof Promise
                    ? name
                    : Promise.reject(new Error("Invalid arguments"));
        return {
            table,
            async ready(callback) {
                const t = await table;
                if (!t)
                    throw new Error("Table not found");
                return t.ready(callback);
            },
        };
    }
    /**
     * Get a table
     * @param name The table name
     * @param columns The columns
     * @returns The table
     * @example
     * const table = database.table("my-table", {
     *   id: { type: Database.Types.INTEGER, primaryKey: true },
     *   name: { type: Database.Types.TEXT, notNull: true },
     *   date: { type: Database.Types.DATETIME },
     * });
     *
     * table.ready(async (table) => {
     *   // Code here will run when the table is ready
     * });
     */
    table(name, columns) {
        return this.readyTable(name, columns);
    }
    /**
     * Delete a table
     * @param name The table name
     * @returns A promise that resolves when the table is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteTable("my-table");
     */
    deleteTable(name) {
        return this.ready(async () => {
            if (this.custom.disconnected)
                throw new Error("Database is disconnected");
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
    deleteDatabase() {
        return this.ready(async () => {
            if (this.custom.disconnected)
                throw new Error("Database is disconnected");
            this.custom.disconnected = true;
            await this.custom.deleteDatabase();
            this.tables.forEach((table) => table.disconnect());
            this.tables.clear();
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=index.js.map