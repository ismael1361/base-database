"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
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
    /**
     * Get the query options
     */
    get options() {
        return JSON.parse(JSON.stringify(this[__private__]));
    }
    where(column, operator, compare) {
        this[__private__].wheres.push({ column, operator, compare });
        return this;
    }
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
    sort(column, ascending = true) {
        this[__private__].order.push({ column, ascending });
        return this;
    }
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
    get(...columns) {
        this.columns(...columns);
        return this.table.selectAll(this);
    }
    /**
     * Get the first row
     * @param columns The columns to select
     * @example
     * query.first("id", "name");
     */
    first(...columns) {
        this.columns(...columns);
        return this.table.selectFirst(this);
    }
    /**
     * Get the last row
     * @param columns The columns to select
     * @example
     * query.last("id", "name");
     */
    last(...columns) {
        this.columns(...columns);
        return this.table.selectLast(this);
    }
    /**
     * Get one row
     * @param columns The columns to select
     * @example
     * query.one("id", "name");
     */
    one(...columns) {
        this.columns(...columns);
        return this.table.selectOne(this);
    }
    /**
     * Get the length of the rows
     * @example
     * query.length();
     */
    length() {
        return this.table.length(this);
    }
    /**
     * Get the count of the rows
     * @example
     * query.count();
     */
    count() {
        return this.table.length(this);
    }
    /**
     * Insert our update a row
     * @param data The data to insert or update
     * @example
     * query.set({ id: 123, name: "hello" });
     */
    async set(data) {
        const exists = await this.table.exists(this);
        if (exists) {
            await this.table.update(data, this);
        }
        else {
            await this.table.insert(data);
        }
    }
    /**
     * Update rows
     * @param data The data to update
     * @example
     * query.update({ name: "world" });
     */
    update(data) {
        return this.table.update(data, this);
    }
    /**
     * Delete rows
     * @example
     * query.delete();
     */
    delete() {
        return this.table.delete(this);
    }
    /**
     * Check if a row exists
     * @example
     * query.exists();
     */
    exists() {
        return this.table.exists(this);
    }
}
exports.Query = Query;
//# sourceMappingURL=Query.js.map