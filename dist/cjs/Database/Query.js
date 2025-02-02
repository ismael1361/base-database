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
//# sourceMappingURL=Query.js.map