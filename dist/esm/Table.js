import BasicEventEmitter from "basic-event-emitter";
import { getDatatype, serializeDataForGet, serializeDataForSet } from "./Utils";
import { Query } from "./Query";
/**
 * Table class
 */
export class Table extends BasicEventEmitter {
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
                type: getDatatype(columns[key].type),
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
        return new Query(Promise.resolve(this));
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
        this.schema = prepare;
        return this;
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
            const rows = await serializeDataForGet(this.serialize, data);
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
            const row = data ? await serializeDataForGet(this.serialize, data) : null;
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
            const row = data ? await serializeDataForGet(this.serialize, data) : null;
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
            const row = data ? await serializeDataForGet(this.serialize, data) : null;
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
        value = await serializeDataForSet(this.serialize, value);
        return await this.ready(() => this.custom.insert(this.name, value)).then((row) => {
            this.emit("insert", this.schema.deserialize(row));
            return Promise.resolve();
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
        value = await serializeDataForSet(this.serialize, value, true);
        const previous = await this.selectAll(query);
        return await this.ready(() => this.custom.update(this.name, value, query.options)).then(() => {
            this.selectAll(query).then((updated) => {
                this.emit("update", updated, previous);
            });
            return Promise.resolve();
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
            this.emit("delete", removed);
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
//# sourceMappingURL=Table.js.map