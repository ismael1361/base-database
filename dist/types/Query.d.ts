import { QueryOptions, Row, Serialize } from "./Types";
import { Table } from "./Table";
declare const __private__: unique symbol;
/**
 * Query class
 */
export declare class Query<S extends Serialize> {
    private readonly table;
    private [__private__];
    /**
     * Create a query
     * @param table The table for consuming the query
     */
    constructor(table: Table<S>);
    /**
     * Get the query options
     */
    get options(): QueryOptions<S>;
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
    where<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S>;
    where<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S>;
    where<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S>;
    where<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S>;
    where<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S>;
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
    filter<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S>;
    filter<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S>;
    filter<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S>;
    filter<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S>;
    filter<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S>;
    /**
     * Take clause for the query
     * @param take The number of rows to take
     * @example
     * query.take(10);
     */
    take(take: number): Query<S>;
    /**
     * Skip clause for the query
     * @param skip The number of rows to skip
     * @example
     * query.skip(10);
     */
    skip(skip: number): Query<S>;
    /**
     * Sort clause for the query
     * @param column The column to sort
     * @example
     * query.sort("name");
     * query.sort("name", false);
     */
    sort(column: string): Query<S>;
    sort(column: keyof S, ascending: boolean): Query<S>;
    /**
     * Order clause for the query
     * @param column The column to order
     * @example
     * query.order("name");
     * query.order("name", false);
     */
    order(column: keyof S): Query<S>;
    order(column: keyof S, ascending: boolean): Query<S>;
    /**
     * Columns should return in selection
     * @param columns The columns to select
     * @example
     * query.columns("id", "name");
     */
    columns<K extends keyof S>(...columns: Array<K>): Query<S>;
    /**
     * Get the rows
     * @param columns The columns to select
     * @example
     * query.get("id", "name");
     */
    get<K extends keyof S>(...columns: Array<K>): Promise<Array<Row<S, K>>>;
    /**
     * Get the first row
     * @param columns The columns to select
     * @example
     * query.first("id", "name");
     */
    first<K extends keyof S>(...columns: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Get the last row
     * @param columns The columns to select
     * @example
     * query.last("id", "name");
     */
    last<K extends keyof S>(...columns: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Get one row
     * @param columns The columns to select
     * @example
     * query.one("id", "name");
     */
    one<K extends keyof S>(...columns: Array<K>): Promise<Row<S, K> | null>;
    /**
     * Get the length of the rows
     * @example
     * query.length();
     */
    length(): Promise<number>;
    /**
     * Get the count of the rows
     * @example
     * query.count();
     */
    count(): Promise<number>;
    /**
     * Insert our update a row
     * @param data The data to insert or update
     * @example
     * query.set({ id: 123, name: "hello" });
     */
    set(data: Partial<Row<S>>): Promise<void>;
    /**
     * Update rows
     * @param data The data to update
     * @example
     * query.update({ name: "world" });
     */
    update(data: Partial<Row<S>>): Promise<void>;
    /**
     * Delete rows
     * @example
     * query.delete();
     */
    delete(): Promise<void>;
    /**
     * Check if a row exists
     * @example
     * query.exists();
     */
    exists(): Promise<boolean>;
}
export {};
//# sourceMappingURL=Query.d.ts.map