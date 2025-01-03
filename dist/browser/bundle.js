(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PocketSafe = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Custom = void 0;
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
     * The database name
     */
    _databaseName;
    /**
     * Create a custom database
     * @param database The database name
     */
    constructor(database) {
        this._databaseName = database;
        this.database = this.connect(database);
    }
    /**
     * Get the database name
     */
    get databaseName() {
        return this._databaseName;
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

},{}],2:[function(require,module,exports){
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

},{"./Custom":1,"./Query":3,"./Table":5,"./Types":6,"./Utils":7,"basic-event-emitter":9}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const Utils_1 = require("./Utils");
const __private__ = Symbol("private");
/**
 * Query class
 */
class Query {
    table;
    [__private__] = {
        wheres: [],
        order: [],
        columns: [],
    };
    /**
     * Create a query
     * @param table The table for consuming the query
     */
    constructor(table) {
        this.table = table;
    }
    insertQuery(query) {
        this[__private__].wheres = this[__private__].wheres.concat(query.options.wheres);
        this[__private__].order = this[__private__].order.concat(query.options.order);
        this[__private__].columns = this[__private__].columns.concat(query.options.columns);
        return this;
    }
    /**
     * Get the query options
     */
    get options() {
        return (0, Utils_1.cloneObject)(this[__private__]);
    }
    /**
     * Where clause for the query
     * @param column The column
     * @param operator The operator
     * @param compare The value to compare
     * @example
     * query.where("id", Database.Operators.EQUAL, 123);
     * query.where("name", Database.Operators.LIKE, "hello");
     * query.where("date", Database.Operators.GREATER_THAN, new Date());
     * query.where("active", Database.Operators.EQUAL, true);
     * query.where("price", Database.Operators.LESS_THAN, 100);
     */
    where(column, operator, compare) {
        this[__private__].wheres.push({ column, operator, compare });
        return this;
    }
    /**
     * Filter clause for the query
     * @param column The column
     * @param operator The operator
     * @param compare The value to compare
     * @example
     * query.filter("id", Database.Operators.EQUAL, 123);
     * query.filter("name", Database.Operators.LIKE, "hello");
     * query.filter("date", Database.Operators.GREATER_THAN, new Date());
     * query.filter("active", Database.Operators.EQUAL, true);
     * query.filter("price", Database.Operators.LESS_THAN, 100);
     */
    filter(column, operator, compare) {
        return this.where(column, operator, compare);
    }
    /**
     * Take clause for the query
     * @param take The number of rows to take
     * @example
     * query.take(10);
     */
    take(take) {
        this[__private__].take = take;
        return this;
    }
    /**
     * Skip clause for the query
     * @param skip The number of rows to skip
     * @example
     * query.skip(10);
     */
    skip(skip) {
        this[__private__].skip = skip;
        return this;
    }
    /**
     * Sort clause for the query
     * @param column The column to sort
     * @example
     * query.sort("name");
     * query.sort("name", false);
     */
    sort(column, ascending = true) {
        this[__private__].order.push({ column, ascending });
        return this;
    }
    /**
     * Order clause for the query
     * @param column The column to order
     * @example
     * query.order("name");
     * query.order("name", false);
     */
    order(column, ascending = true) {
        return this.sort(column, ascending);
    }
    /**
     * Columns should return in selection
     * @param columns The columns to select
     * @example
     * query.columns("id", "name");
     */
    columns(...columns) {
        this[__private__].columns = [...this[__private__].columns, ...columns];
        return this;
    }
    /**
     * Get the rows
     * @param columns The columns to select
     * @example
     * query.get("id", "name");
     */
    async get(...columns) {
        this.columns(...columns);
        return (await this.table.then((t) => t.selectAll(this)));
    }
    /**
     * Get the first row
     * @param columns The columns to select
     * @example
     * query.first("id", "name");
     */
    async first(...columns) {
        this.columns(...columns);
        return (await this.table.then((t) => t.selectFirst(this)));
    }
    /**
     * Get the last row
     * @param columns The columns to select
     * @example
     * query.last("id", "name");
     */
    async last(...columns) {
        this.columns(...columns);
        return (await this.table.then((t) => t.selectLast(this)));
    }
    /**
     * Get one row
     * @param columns The columns to select
     * @example
     * query.one("id", "name");
     */
    async one(...columns) {
        this.columns(...columns);
        return (await this.table.then((t) => t.selectOne(this)));
    }
    /**
     * Get the length of the rows
     * @example
     * query.length();
     */
    async length() {
        return await this.table.then((t) => t.length(this));
    }
    /**
     * Get the count of the rows
     * @example
     * query.count();
     */
    async count() {
        return await this.table.then((t) => t.length(this));
    }
    /**
     * Update a row
     * @param data The data to insert or update
     * @example
     * query.set({ id: 123, name: "hello" });
     */
    async set(data) {
        await this.table.then((t) => t.update(data, this));
    }
    /**
     * Update rows
     * @param data The data to update
     * @example
     * query.update({ name: "world" });
     */
    async update(data) {
        return await this.table.then((t) => t.update(data, this));
    }
    /**
     * Delete rows
     * @example
     * query.delete();
     */
    async delete() {
        return await this.table.then((t) => t.delete(this));
    }
    /**
     * Check if a row exists
     * @example
     * query.exists();
     */
    async exists() {
        return await this.table.then((t) => t.exists(this));
    }
}
exports.Query = Query;

},{"./Utils":7}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadablePath = void 0;
const getLoadablePath = () => {
    throw new Error("Unsupported platform for sqlite-regex, on a browser environment. Consult the sqlite-regex NPM package README for details.");
};
exports.getLoadablePath = getLoadablePath;

},{}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
const Utils_1 = require("./Utils");
const Query_1 = require("./Query");
const eventsEmitters = new Map();
/**
 * Table class
 */
class Table extends basic_event_emitter_1.default {
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
    schema = {
        schema: {},
        creator: (row) => row,
        serializer: (obj) => obj,
        deserialize: (row) => row,
        serialize: (obj) => obj,
    };
    _events = new basic_event_emitter_1.default();
    _clearEvents = [];
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
        super();
        this.custom = custom;
        this.name = name;
        this.serialize = Object.keys(columns).reduce((acc, key) => {
            acc[key] = {
                type: (0, Utils_1.getDatatype)(columns[key].type),
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
        this.pipeEvent();
    }
    pipeEvent() {
        this._clearEvents.splice(0).forEach((event) => event.stop());
        const mapName = [this.custom.databaseName, this.name].join(":");
        let eventEmitter = eventsEmitters.get(mapName);
        if (!eventsEmitters.has(mapName) || !eventEmitter) {
            eventEmitter = new basic_event_emitter_1.default();
            eventsEmitters.set(mapName, eventEmitter);
        }
        this._clearEvents.push(eventEmitter.on("insert", (row) => {
            this.emit("insert", this.schema.deserialize(row));
        }));
        this._clearEvents.push(eventEmitter.on("update", (rows, previous) => {
            this.emit("update", rows.map((row) => this.schema.deserialize(row)), previous.map((row) => this.schema.deserialize(row)));
        }));
        this._clearEvents.push(eventEmitter.on("delete", (rows) => {
            this.emit("delete", rows.map((row) => this.schema.deserialize(row)));
        }));
        this._events = eventEmitter;
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
     * Create a query object
     * @returns The query object
     * @example
     * table.query()
     *  .where("id", Database.Operators.EQUAL, 123)
     *  .sort("name")
     *  .take(10)
     *  .get("id", "name");
     */
    query() {
        return new Query_1.Query(Promise.resolve(this));
    }
    /**
     * Bind a schema to the table
     * @param schema The schema
     * @param options The options
     * @param options.serializer The serializer
     * @param options.creator The creator
     * @returns The table
     * @example
     * class MyClass {
     *    ...
     *    serialize() { ... }
     *    static create() { ... }
     * }
     *
     * const schema = table.bindSchema(MyClass, { serializer: "serialize", creator: "create" });
     */
    bindSchema(schema, options = {}) {
        if (typeof schema !== "function") {
            throw new TypeError("constructor must be a function");
        }
        if (typeof options.serializer === "undefined") {
            if (typeof schema.prototype.serialize === "function") {
                options.serializer = schema.prototype.serialize;
            }
        }
        else if (typeof options.serializer === "string") {
            if (typeof schema.prototype[options.serializer] === "function") {
                options.serializer = schema.prototype[options.serializer];
            }
            else {
                throw new TypeError(`${schema.name}.prototype.${options.serializer} is not a function, cannot use it as serializer`);
            }
        }
        else if (typeof options.serializer !== "function") {
            throw new TypeError(`serializer for class ${schema.name} must be a function, or the name of a prototype method`);
        }
        if (typeof options.creator === "undefined") {
            if (typeof schema.create === "function") {
                options.creator = schema.create;
            }
        }
        else if (typeof options.creator === "string") {
            if (typeof schema[options.creator] === "function") {
                options.creator = schema[options.creator];
            }
            else {
                throw new TypeError(`${schema.name}.${options.creator} is not a function, cannot use it as creator`);
            }
        }
        else if (typeof options.creator !== "function") {
            throw new TypeError(`creator for class ${schema.name} must be a function, or the name of a static method`);
        }
        const prepare = {
            schema: schema,
            creator: options.creator,
            serializer: options.serializer,
            deserialize(row) {
                if (typeof this.creator === "function") {
                    return this.creator.call(this.schema, row);
                }
                return new this.schema(row);
            },
            serialize(obj) {
                if (typeof this.serializer === "function") {
                    return this.serializer.call(obj, obj);
                }
                else if (obj && typeof obj.serialize === "function") {
                    return obj.serialize(obj);
                }
                return obj;
            },
        };
        const self = Object.create(this, { _clearEvents: { value: [] }, schema: { value: prepare } });
        self.clearEvents();
        self.pipeEvent();
        return self;
    }
    /**
     * Select all rows from the table
     * @param query The query
     * @returns The rows
     * @example
     * await table.selectAll(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    async selectAll(query) {
        return await this.ready(async () => {
            const data = await this.custom.selectAll(this.name, query?.options);
            const rows = await (0, Utils_1.serializeDataForGet)(this.serialize, data);
            return rows.map((row) => this.schema.deserialize(row));
        });
    }
    /**
     * Select one row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectOne(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    async selectOne(query) {
        return await this.ready(async () => {
            const data = await this.custom.selectOne(this.name, query?.options);
            const row = data ? await (0, Utils_1.serializeDataForGet)(this.serialize, data) : null;
            return row ? this.schema.deserialize(row) : null;
        });
    }
    /**
     * Select the first row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectFirst(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    async selectFirst(query) {
        return await this.ready(async () => {
            const data = await this.custom.selectFirst(this.name, query?.options);
            const row = data ? await (0, Utils_1.serializeDataForGet)(this.serialize, data) : null;
            return row ? this.schema.deserialize(row) : null;
        });
    }
    /**
     * Select the last row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectLast(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    async selectLast(query) {
        return await this.ready(async () => {
            const data = await this.custom.selectLast(this.name, query?.options);
            const row = data ? await (0, Utils_1.serializeDataForGet)(this.serialize, data) : null;
            return row ? this.schema.deserialize(row) : null;
        });
    }
    /**
     * Check if a row exists
     * @param query The query
     * @returns If the row exists
     * @example
     * await table.exists(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    exists(query) {
        return this.ready(async () => {
            const data = await this.custom.selectOne(this.name, query.options);
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
        let value = this.schema.serialize(data);
        value = await (0, Utils_1.serializeDataForSet)(this.serialize, value);
        return await this.ready(() => this.custom.insert(this.name, value)).then(async (row) => {
            row = await (0, Utils_1.serializeDataForGet)(this.serialize, row);
            this._events.emit("insert", row);
            // this.emit("insert", this.schema.deserialize(row));
            return Promise.resolve(this.schema.deserialize(row));
        });
    }
    /**
     * Update rows in the table
     * @param data The data to update
     * @param query The query
     * @returns A promise
     * @throws If a column is null and not nullable
     * @throws If a column has an invalid datatype
     * @example
     * await table.update({ name: "world" }, table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    async update(data, query) {
        let value = this.schema.serialize(data);
        value = await (0, Utils_1.serializeDataForSet)(this.serialize, value, true);
        const previous = await this.selectAll(query);
        return await this.ready(() => this.custom.update(this.name, value, query.options))
            .then(() => this.selectAll(query))
            .then(async (updated) => {
            updated = (await (0, Utils_1.serializeDataForGet)(this.serialize, updated));
            this._events.emit("update", updated.map((row) => this.schema.serialize(row)), previous.map((row) => this.schema.serialize(row)));
            // this.emit("update", updated, previous);
            return Promise.resolve(updated.map((row) => this.schema.deserialize(row)));
        });
    }
    /**
     * Delete rows from the table
     * @param query The query
     * @returns A promise
     * @example
     * await table.delete(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    async delete(query) {
        const removed = await this.selectAll(query);
        return await this.ready(() => this.custom.delete(this.name, query.options)).then(() => {
            this._events.emit("delete", removed.map((row) => this.schema.serialize(row)));
            // this.emit("delete", removed);
            return Promise.resolve();
        });
    }
    /**
     * Get the length of the table
     * @param query The query
     * @returns The length
     * @example
     * await table.length(table.query.where("id", Database.Operators.EQUAL, 123 }));
     * await table.length();
     */
    length(query) {
        return this.ready(() => this.custom.length(this.name, query?.options));
    }
}
exports.Table = Table;

},{"./Query":3,"./Utils":7,"basic-event-emitter":9}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDataForGet = exports.serializeDataForSet = exports.verifyDatatype = exports.getDatatype = exports.cloneObject = exports.isLiteralObject = exports.columns = exports.generateUUID = exports.Types = exports.Operators = void 0;
exports.Operators = {
    EQUAL: "=",
    NOT_EQUAL: "!=",
    GREATER_THAN: ">",
    LESS_THAN: "<",
    GREATER_THAN_OR_EQUAL: ">=",
    LESS_THAN_OR_EQUAL: "<=",
    BETWEEN: "BETWEEN",
    NOT_BETWEEN: "NOT BETWEEN",
    LIKE: "LIKE",
    NOT_LIKE: "NOT LIKE",
    IN: "IN",
    NOT_IN: "NOT IN",
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
const generateUUID = (separator = "") => {
    let currentTime = Date.now();
    return `xxxxxxxx${separator}xxxx${separator}4xxx${separator}yxxx${separator}xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
        const r = (currentTime + Math.random() * 16) % 16 | 0;
        currentTime = Math.floor(currentTime / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
};
exports.generateUUID = generateUUID;
const columns = (columns) => {
    return Object.keys(columns).reduce((acc, key) => {
        acc[key] = {
            type: columns[key].type,
            primaryKey: columns[key].primaryKey ?? false,
            autoIncrement: columns[key].autoIncrement ?? false,
            notNull: columns[key].notNull ?? false,
            default: columns[key].default,
            unique: columns[key].unique ?? false,
            check: columns[key].check,
        };
        return acc;
    }, {});
};
exports.columns = columns;
const isLiteralObject = (obj) => {
    return obj !== null && typeof obj === "object" && !(obj instanceof Object.constructor);
};
exports.isLiteralObject = isLiteralObject;
const cloneObject = (obj) => {
    const result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (typeof obj[key] === "object" && obj[key] !== null && ![Date, RegExp].includes(obj[key].constructor)) {
            result[key] = (0, exports.isLiteralObject)(obj[key]) ? (0, exports.cloneObject)(obj[key]) : Object.assign(Object.create(Object.getPrototypeOf(obj[key])), obj[key]);
        }
        else {
            result[key] = obj[key];
        }
    }
    return result;
};
exports.cloneObject = cloneObject;
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
    if (["NULL", "TEXT", "BIGINT", "INTEGER", "FLOAT", "BOOLEAN", "DATETIME"].includes(value))
        return value;
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
const serializeDataForSet = (serialize, data, isPartial = false) => {
    return new Promise((resolve, reject) => {
        for (const key in isPartial ? data : serialize) {
            if (!(key in data)) {
                if (serialize[key].default !== undefined) {
                    data[key] = typeof serialize[key].default === "function" ? serialize[key].default() : serialize[key].default;
                }
                // else if (!serialize[key].autoIncrement) {
                // 	return reject(new Error(`Missing column ${key}`));
                // }
            }
            if (serialize[key].autoIncrement) {
                delete data[key];
                continue;
            }
            if (serialize[key].notNull && (!(key in data) || data[key] === null || data[key] === undefined)) {
                return reject(new Error(`Column ${key} cannot be null or undefined`));
            }
            if (key in data && data[key] !== null && data[key] !== undefined) {
                if (!(0, exports.verifyDatatype)(data[key], (0, exports.getDatatype)(serialize[key].type))) {
                    return reject(new Error(`Invalid datatype for column ${key}`));
                }
                if (typeof data[key] === "string" && Array.isArray(serialize[key].options) && serialize[key].options.length > 0) {
                    if (!serialize[key].options.includes(data[key])) {
                        return reject(new Error(`Invalid value for column ${key}`));
                    }
                }
                if (typeof serialize[key].check === "function") {
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
            switch ((0, exports.getDatatype)(serialize[key].type)) {
                case "TEXT":
                    data[key] = typeof data[key] === "string" ? data[key] : undefined;
                    break;
                case "INTEGER":
                case "FLOAT":
                    data[key] = typeof data[key] === "number" ? data[key] : undefined;
                    break;
                case "BOOLEAN":
                    data[key] = typeof data[key] === "boolean" ? data[key] : undefined;
                    break;
                case "DATETIME":
                    data[key] = data[key] instanceof Date ? data[key].getTime() : typeof data[key] === "number" ? data[key] : undefined;
                    break;
                case "BIGINT":
                    data[key] = typeof data[key] === "bigint" ? data[key] : ["string", "number"].includes(typeof data[key]) ? BigInt(data[key]) : undefined;
                    break;
                case "NULL":
                    data[key] = data[key] === null ? data[key] : undefined;
                    break;
            }
            if (data[key] === undefined) {
                delete data[key];
            }
        }
        resolve(data);
    });
};
exports.serializeDataForSet = serializeDataForSet;
const serializeDataForGet = (serialize, data) => {
    return new Promise((resolve, reject) => {
        const list = (Array.isArray(data) ? data : [data]).map((data) => {
            for (const key in serialize) {
                if (!(key in data)) {
                    if (serialize[key].default !== undefined) {
                        data[key] = typeof serialize[key].default === "function" ? serialize[key].default() : serialize[key].default;
                    }
                }
                switch ((0, exports.getDatatype)(serialize[key].type)) {
                    case "TEXT":
                        data[key] = typeof data[key] === "string" ? data[key] : undefined;
                        break;
                    case "INTEGER":
                    case "FLOAT":
                        data[key] = typeof data[key] === "number" ? data[key] : undefined;
                        break;
                    case "BOOLEAN":
                        data[key] = typeof data[key] === "boolean" ? data[key] : undefined;
                        break;
                    case "DATETIME":
                        data[key] = data[key] instanceof Date ? data[key] : typeof data[key] === "number" ? new Date(data[key]) : undefined;
                        break;
                    case "BIGINT":
                        data[key] = typeof data[key] === "bigint" ? data[key] : ["string", "number"].includes(typeof data[key]) ? BigInt(data[key]) : undefined;
                        break;
                    case "NULL":
                        data[key] = data[key] !== null ? data[key] : undefined;
                        break;
                }
                if (data[key] !== null && data[key] !== undefined && !(0, exports.verifyDatatype)(data[key], (0, exports.getDatatype)(serialize[key].type))) {
                    delete data[key];
                }
                if (data[key] !== null && data[key] !== undefined && typeof serialize[key].check === "function") {
                    try {
                        const isValid = serialize[key].check(data[key]);
                        if (isValid instanceof Error) {
                            delete data[key];
                        }
                    }
                    catch (e) {
                        delete data[key];
                    }
                }
            }
            return data;
        });
        resolve(Array.isArray(data) ? list : list[0]);
    });
};
exports.serializeDataForGet = serializeDataForGet;

},{}],8:[function(require,module,exports){
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteRegex = void 0;
const Database = __importStar(require("./Database"));
__exportStar(require("./Database"), exports);
exports.SQLiteRegex = __importStar(require("./SQLiteRegex"));
exports.default = Database;

},{"./Database":2,"./SQLiteRegex":4}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicEventEmitter = void 0;
const _subscriptions = Symbol("subscriptions");
const _oneTimeEvents = Symbol("oneTimeEvents");
function runCallback(callback, ...arg) {
    callback(...arg);
}
/**
 * BasicEventEmitter class
 */
class BasicEventEmitter {
    [_subscriptions];
    [_oneTimeEvents];
    _ready = false;
    /**
     * Create a new BasicEventEmitter
     */
    constructor() {
        this[_subscriptions] = [];
        this[_oneTimeEvents] = new Map();
        this.on("internal_ready", () => {
            this._ready = true;
        });
    }
    /**
     * Wait for the emitter to be ready
     * @param callback Callback to call when the emitter is ready
     * @returns Promise
     *
     * @example
     * const emitter = new BasicEventEmitter<{}>();
     *
     * emitter.ready(() => {
     *     console.log("Emitter is ready");
     * });
     *
     * emitter.prepared = true;
     * // Output: Emitter is ready
     */
    async ready(callback) {
        if (this._ready) {
            const response = await callback?.();
            return Promise.resolve(response);
        }
        return new Promise((resolve) => {
            this.once("internal_ready", (async () => {
                const response = await callback?.();
                resolve(response);
            }));
        });
    }
    /**
     * Property to get the emitter as prepared
     * @returns boolean
     *
     * @example
     * const emitter = new BasicEventEmitter<{}>();
     *
     * emitter.ready(() => {
     *      console.log("Emitter is ready");
     * });
     *
     * console.log(emitter.prepared);
     * // Output: false
     *
     * emitter.prepared = true;
     * console.log(emitter.prepared);
     * // Output: true
     */
    get prepared() {
        return this._ready;
    }
    /**
     * Property to set the emitter as prepared
     * @param value Value to set
     *
     * @example
     * const emitter = new BasicEventEmitter<{}>();
     *
     * emitter.ready(() => {
     *      console.log("Emitter is ready");
     * });
     *
     * emitter.prepared = true;
     * // Output: Emitter is ready
     */
    set prepared(value) {
        if (value === true) {
            this.emit("internal_ready");
        }
        this._ready = value;
    }
    /**
     * Clear all events
     * @returns void
     * @example
     * const emitter = new BasicEventEmitter<{}>();
     * emitter.clearEvents();
     * // All events are cleared
     */
    clearEvents() {
        this[_subscriptions] = [];
        this[_oneTimeEvents].clear();
    }
    /**
     * Add a listener to an event
     * @param event Event to listen to
     * @param callback Callback to call when the event is emitted
     * @returns BasicEventHandler
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.on("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Alice");
     * // Output: Hello, Alice!
     */
    on(event, callback) {
        if (this[_oneTimeEvents].has(event)) {
            runCallback(callback, ...(this[_oneTimeEvents].get(event) ?? []));
        }
        else {
            this[_subscriptions].push({ event, callback: callback, once: false });
        }
        const self = this;
        return {
            stop() {
                self.off(event, callback);
            },
            remove() {
                this.stop();
            },
        };
    }
    /**
     * Remove a listener from an event
     * @param event Event to remove the listener from
     * @param callback Callback to remove
     * @returns BasicEventEmitter
     *
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * const listener = (name) => {
     *      console.log(`Hello, ${name}!`);
     * }
     *
     * emitter.on("greet", listener);
     * emitter.off("greet", listener);
     *
     * emitter.emit("greet", "Alice");
     * // No output
     */
    off(event, callback) {
        this[_subscriptions] = this[_subscriptions].filter((s) => s.event !== event || (callback && s.callback !== callback));
        return this;
    }
    /**
     * Add a listener that will be removed after being called once
     * @param event Event to listen to
     * @param callback Callback to call when the event is emitted
     * @returns Promise that resolves when the event is emitted
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.once("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Alice");
     * // Output: Hello, Alice!
     */
    once(event, callback) {
        return new Promise((resolve) => {
            const ourCallback = (...arg) => {
                const r = callback?.(...arg);
                resolve(r);
            };
            if (this[_oneTimeEvents].has(event)) {
                runCallback(ourCallback, ...(this[_oneTimeEvents].get(event) ?? []));
            }
            else {
                this[_subscriptions].push({
                    event,
                    callback: ourCallback,
                    once: true,
                });
            }
        });
    }
    /**
     * Remove a listener that was added with `once`
     * @param event Event to remove the listener from
     * @param callback Callback to remove
     * @returns BasicEventEmitter
     *
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * const listener = (name) => {
     *      console.log(`Hello, ${name}!`);
     * }
     *
     * emitter.once("greet", listener);
     * emitter.offOnce("greet", listener);
     */
    offOnce(event, callback) {
        this[_subscriptions] = this[_subscriptions].filter((s) => s.event !== event || (callback && s.callback !== callback) || !s.once);
        return this;
    }
    /**
     * Emit an event
     * @param event Event to emit
     * @param arg Arguments to pass to the event
     * @returns BasicEventEmitter
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.on("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Alice");
     * // Output: Hello, Alice!
     */
    emit(event, ...arg) {
        if (this[_oneTimeEvents].has(event)) {
            throw new Error(`Event "${String(event)}" was supposed to be emitted only once`);
        }
        for (let i = 0; i < this[_subscriptions].length; i++) {
            const s = this[_subscriptions][i];
            if (s.event !== event) {
                continue;
            }
            runCallback(s.callback, ...arg);
            if (s.once) {
                this[_subscriptions].splice(i, 1);
                i--;
            }
        }
        return this;
    }
    /**
     * Emit an event only once
     * @param event Event to emit
     * @param arg Arguments to pass to the event
     * @returns BasicEventEmitter
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.emitOnce("greet", "Alice");
     * emitter.on("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Bob");
     * // Output: Hello, Alice!
     */
    emitOnce(event, ...arg) {
        if (this[_oneTimeEvents].has(event)) {
            throw new Error(`Event "${String(event)}" was supposed to be emitted only once`);
        }
        this.emit(event, ...arg);
        this[_oneTimeEvents].set(event, arg); // Mark event as being emitted once for future subscribers
        this.offOnce(event); // Remove all listeners for this event, they won't fire again
        return this;
    }
    /**
     * Pipe events from one emitter to another
     * @param event Event to pipe
     * @param eventEmitter Emitter to pipe to
     * @returns BasicEventHandler
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * const anotherEmitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.pipe("greet", anotherEmitter);
     *
     * anotherEmitter.on("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Alice");
     * // Output: Hello, Alice!
     */
    pipe(event, eventEmitter) {
        return this.on(event, (...arg) => {
            eventEmitter.emit(event, ...arg);
        });
    }
    /**
     * Pipe events from one emitter to another, but only once
     * @param event Event to pipe
     * @param eventEmitter Emitter to pipe to
     * @returns Promise that resolves when the event is emitted
     * @example
     * const emitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * const anotherEmitter = new BasicEventEmitter<{
     *      greet: (name: string) => void;
     *      farewell: (name: string) => void;
     * }>();
     *
     * emitter.pipeOnce("greet", anotherEmitter);
     *
     * anotherEmitter.on("greet", (name) => {
     *      console.log(`Hello, ${name}!`);
     * });
     *
     * emitter.emit("greet", "Alice");
     * // Output: Hello, Alice!
     */
    pipeOnce(event, eventEmitter) {
        return this.once(event, (...arg) => {
            eventEmitter.emitOnce(event, ...arg);
        });
    }
}
exports.BasicEventEmitter = BasicEventEmitter;
exports.default = BasicEventEmitter;

},{}]},{},[8])(8)
});
