import BasicEventEmitter from "basic-event-emitter";
import { Table } from "./Table";
import { Query } from "./Query";
import { ERROR_FACTORY } from "../Error";
export * from "./Utils";
export * from "./Types";
export * from "./Custom";
export * from "./Table";
/**
 * Database class
 */
export class Database extends BasicEventEmitter {
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
     * The tables names
     */
    tablesNames = [];
    /**
     * Create a database
     * @param custom The custom database class
     * @param database The database name
     * @example
     * const database = new Database(CustomDatabase, "my-database");
     */
    constructor(custom, database) {
        super();
        this.database = database;
        this.custom = new custom(database);
        this.prepared = true;
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
        await super.ready();
        return await this.custom.ready(() => callback?.(this) ?? Promise.resolve(undefined));
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
        this.emit("disconnect");
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
    async forTable(name, columns) {
        try {
            return await this.ready(() => {
                if (this.custom.disconnected)
                    throw ERROR_FACTORY.create("Database.forTable", "db-disconnected" /* Errors.DB_DISCONNECTED */, { dbName: this.database });
                let table = this.tables.get(name);
                if (!table) {
                    table = new Table(this.custom, name, columns);
                    this.tables.set(name, table);
                    this.tablesNames = this.tablesNames.concat([name]).filter((value, index, self) => self.indexOf(value) === index);
                }
                return Promise.resolve(table);
            });
        }
        catch (e) {
            throw ERROR_FACTORY.create("Database.forTable", "internal-error" /* Errors.INTERNAL_ERROR */, { message: "message" in e ? e.message : String(e) });
        }
    }
    readyTable(name, columns) {
        const table = typeof name === "string" && this.tables.has(name)
            ? Promise.resolve(this.tables.get(name))
            : typeof name === "string" && columns
                ? this.forTable(name, columns)
                : name instanceof Promise
                    ? name
                    : Promise.reject(ERROR_FACTORY.create("Database.readyTable", "invalid-argument" /* Errors.INVALID_ARGUMENT */, { message: "Valid arguments: (name: string, columns: Serialize) or (table: Promise<Table<S, O>>)" }));
        const self = this;
        return {
            table,
            async ready(callback) {
                const t = await this.table;
                if (!t)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return t.ready(callback);
            },
            query() {
                return new Query(this.table);
            },
            async insert(data) {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.insert(data));
            },
            async selectAll() {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.selectAll());
            },
            async selectOne() {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.selectOne());
            },
            async selectFirst() {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.selectFirst());
            },
            async selectLast() {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.selectLast());
            },
            async length() {
                if (!this.table)
                    throw ERROR_FACTORY.create("Database.readyTable", "db-table-not-found" /* Errors.DB_TABLE_NOT_FOUND */, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
                return await this.table.then((t) => t.length());
            },
            on(name, callback) {
                this.table.then((t) => t.on(name, callback));
                const self = this;
                return {
                    remove() {
                        self.table.then((t) => t.off(name, callback));
                    },
                    stop() {
                        this.remove();
                    },
                };
            },
            async once(name, callback) {
                return await this.table.then((t) => t.once(name, callback));
            },
            off(name, callback) {
                this.table.then((t) => t.off(name, callback));
            },
            offOnce(name, callback) {
                this.table.then((t) => t.offOnce(name, callback));
            },
            schema(schema, options) {
                const t = this.table.then((t) => t.bindSchema(schema, options));
                return Object.create(this, { table: { value: t } });
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
     *
     * table.query().where("id", Database.Operators.EQUAL, 123).get("id", "name");
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
    async deleteTable(name) {
        try {
            return await this.ready(async () => {
                if (this.custom.disconnected)
                    throw ERROR_FACTORY.create("Database.deleteTable", "db-disconnected" /* Errors.DB_DISCONNECTED */, { dbName: this.database });
                await this.custom.deleteTable(name);
                this.tables.delete(name);
                this.tablesNames = this.tablesNames.filter((value) => value !== name);
                this.emit("deleteTable", name);
            });
        }
        catch (e) {
            throw ERROR_FACTORY.create("Database.deleteTable", "internal-error" /* Errors.INTERNAL_ERROR */, { message: "message" in e ? e.message : String(e) });
        }
    }
    /**
     * Delete the database
     * @returns A promise that resolves when the database is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteDatabase();
     */
    async deleteDatabase() {
        // if (this.custom.disconnected) throw ERROR_FACTORY.create("Database.deleteTable", Errors.DB_DISCONNECTED, { dbName: this.database });
        try {
            this.custom.disconnected = true;
            await this.custom.deleteDatabase();
            this.tables.forEach((table) => table.disconnect());
            this.tables.clear();
            this.tablesNames = [];
            this.emit("delete");
        }
        catch (e) {
            throw ERROR_FACTORY.create("Database.deleteDatabase", "internal-error" /* Errors.INTERNAL_ERROR */, { message: "message" in e ? e.message : String(e) });
        }
    }
}
//# sourceMappingURL=Database.js.map