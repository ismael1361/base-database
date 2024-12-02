import BasicEventEmitter from "basic-event-emitter";
import { getDatatype, serializeData } from "./Utils";
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
        data = await serializeData(this.serialize, data);
        return this.ready(() => this.custom.insert(this.name, data)).then(() => {
            this.emit("insert", data);
            return Promise.resolve();
        });
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
        data = await serializeData(this.serialize, data, true);
        return this.ready(() => this.custom.update(this.name, data, where)).then(() => {
            this.emit("update", data, where);
            return Promise.resolve();
        });
    }
    /**
     * Delete rows from the table
     * @param where The where clause
     * @returns A promise
     * @example
     * await table.delete(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
     */
    delete(where) {
        return this.ready(() => this.custom.delete(this.name, where)).then(() => {
            this.emit("delete", where);
            return Promise.resolve();
        });
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
//# sourceMappingURL=Table.js.map