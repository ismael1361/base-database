import { Operator, QueryOptions, Row, RowDeserialize, RowSerialize, Serialize } from "./Types";
import { Table } from "./Table";

const __private__ = Symbol("private");

type IsNever<T> = [T] extends [never] ? true : false;

type ResolveNever<T, K> = IsNever<K> extends true ? T : K;

/**
 * Query class
 */
export class Query<S extends Serialize, O = Row<S>, K extends keyof S = never> {
	private [__private__]: QueryOptions<S> = {
		wheres: [],
		order: [],
		columns: [],
	};

	/**
	 * Create a query
	 * @param table The table for consuming the query
	 */
	constructor(private readonly table: Promise<Table<S, O>>) {}

	insertQuery<C extends keyof S>(query: Query<S, O, C>): Query<S, O, K | C> {
		this[__private__].wheres = this[__private__].wheres.concat(query.options.wheres);
		this[__private__].order = this[__private__].order.concat(query.options.order);
		this[__private__].columns = this[__private__].columns.concat(query.options.columns);
		return this as any;
	}

	/**
	 * Get the query options
	 */
	get options(): QueryOptions<S> {
		return JSON.parse(JSON.stringify(this[__private__]));
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
	where<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S, O, K>;
	where<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S, O, K>;
	where<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S, O, K>;
	where<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S, O, K>;
	where<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S, O, K>;
	where(column: string, operator: Operator, compare: any): Query<S, O, K> {
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
	filter<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S, O, K>;
	filter<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S, O, K>;
	filter<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S, O, K>;
	filter<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S, O, K>;
	filter<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S, O, K>;
	filter(column: string, operator: Operator, compare: any): Query<S, O, K> {
		return this.where(column, operator as any, compare);
	}

	/**
	 * Take clause for the query
	 * @param take The number of rows to take
	 * @example
	 * query.take(10);
	 */
	take(take: number): Query<S, O, K> {
		this[__private__].take = take;
		return this;
	}

	/**
	 * Skip clause for the query
	 * @param skip The number of rows to skip
	 * @example
	 * query.skip(10);
	 */
	skip(skip: number): Query<S, O, K> {
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
	sort(column: string): Query<S, O, K>;
	sort(column: keyof S, ascending: boolean): Query<S, O, K>;
	sort(column: keyof S | string, ascending: boolean = true): Query<S, O, K> {
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
	order(column: keyof S): Query<S, O, K>;
	order(column: keyof S, ascending: boolean): Query<S, O, K>;
	order(column: keyof S | string, ascending: boolean = true): Query<S, O, K> {
		return this.sort(column, ascending);
	}

	/**
	 * Columns should return in selection
	 * @param columns The columns to select
	 * @example
	 * query.columns("id", "name");
	 */
	columns<C extends keyof S>(...columns: C[]): Query<S, O, K | C> {
		this[__private__].columns = [...this[__private__].columns, ...columns];
		return this as any;
	}

	/**
	 * Get the rows
	 * @param columns The columns to select
	 * @example
	 * query.get("id", "name");
	 */
	async get<C extends keyof S = ResolveNever<keyof S, K>>(...columns: Array<C>): Promise<Array<RowDeserialize<S, O, K | C>>> {
		this.columns(...columns);
		return (await this.table.then((t) => t.selectAll(this))) as any;
	}

	/**
	 * Get the first row
	 * @param columns The columns to select
	 * @example
	 * query.first("id", "name");
	 */
	async first<C extends keyof S = ResolveNever<keyof S, K>>(...columns: Array<C>): Promise<RowDeserialize<S, O, K | C> | null> {
		this.columns(...columns);
		return (await this.table.then((t) => t.selectFirst(this))) as any;
	}

	/**
	 * Get the last row
	 * @param columns The columns to select
	 * @example
	 * query.last("id", "name");
	 */
	async last<C extends keyof S = ResolveNever<keyof S, K>>(...columns: Array<C>): Promise<RowDeserialize<S, O, K | C> | null> {
		this.columns(...columns);
		return (await this.table.then((t) => t.selectLast(this))) as any;
	}

	/**
	 * Get one row
	 * @param columns The columns to select
	 * @example
	 * query.one("id", "name");
	 */
	async one<C extends keyof S = ResolveNever<keyof S, K>>(...columns: Array<C>): Promise<RowDeserialize<S, O, K | C> | null> {
		this.columns(...columns);
		return (await this.table.then((t) => t.selectOne(this))) as any;
	}

	/**
	 * Get the length of the rows
	 * @example
	 * query.length();
	 */
	async length(): Promise<number> {
		return await this.table.then((t) => t.length(this));
	}

	/**
	 * Get the count of the rows
	 * @example
	 * query.count();
	 */
	async count(): Promise<number> {
		return await this.table.then((t) => t.length(this));
	}

	/**
	 * Update a row
	 * @param data The data to insert or update
	 * @example
	 * query.set({ id: 123, name: "hello" });
	 */
	async set(data: RowSerialize<S, O>): Promise<void> {
		await this.table.then((t) => t.update(data, this));
	}

	/**
	 * Update rows
	 * @param data The data to update
	 * @example
	 * query.update({ name: "world" });
	 */
	async update(data: RowSerialize<S, O>): Promise<void> {
		return await this.table.then((t) => t.update(data, this));
	}

	/**
	 * Delete rows
	 * @example
	 * query.delete();
	 */
	async delete(): Promise<void> {
		return await this.table.then((t) => t.delete(this));
	}

	/**
	 * Check if a row exists
	 * @example
	 * query.exists();
	 */
	async exists(): Promise<boolean> {
		return await this.table.then((t) => t.exists(this));
	}
}
