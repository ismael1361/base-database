"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
const Table_1 = require("./Table");
const Query_1 = require("./Query");
// import { TableReady } from "./TableReady";
__exportStar(require("./Types"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Custom"), exports);
__exportStar(require("./Table"), exports);
/**
 * Database class
 */
class Database extends basic_event_emitter_1.default {
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
        super();
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
    forTable(name, columns) {
        return this.ready(() => {
            if (this.custom.disconnected)
                throw new Error("Database is disconnected");
            let table = this.tables.get(name);
            if (!table) {
                table = new Table_1.Table(this.custom, name, columns);
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
                const t = await this.table;
                if (!t)
                    throw new Error("Table not found");
                return t.ready(callback);
            },
            query() {
                return new Query_1.Query(this.table);
            },
            async insert(data) {
                if (!this.table)
                    throw new Error("Table not found");
                return await this.table.then((t) => t.insert(data));
            },
            async selectAll() {
                if (!this.table)
                    throw new Error("Table not found");
                return await this.table.then((t) => t.selectAll());
            },
            async selectOne() {
                if (!this.table)
                    throw new Error("Table not found");
                return await this.table.then((t) => t.selectOne());
            },
            async selectFirst() {
                if (!this.table)
                    throw new Error("Table not found");
                return await this.table.then((t) => t.selectFirst());
            },
            async selectLast() {
                if (!this.table)
                    throw new Error("Table not found");
                return await this.table.then((t) => t.selectLast());
            },
            async length() {
                if (!this.table)
                    throw new Error("Table not found");
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
    deleteTable(name) {
        return this.ready(async () => {
            if (this.custom.disconnected)
                throw new Error("Database is disconnected");
            await this.custom.deleteTable(name);
            this.tables.delete(name);
            this.emit("deleteTable", name);
        });
    }
    /**
     * Delete the database
     * @returns A promise that resolves when the database is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteDatabase();
     */
    async deleteDatabase() {
        // if (this.custom.disconnected) throw new Error("Database is disconnected");
        this.custom.disconnected = true;
        await this.custom.deleteDatabase();
        this.tables.forEach((table) => table.disconnect());
        this.tables.clear();
        this.emit("delete");
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map