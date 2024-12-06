import { Operator, QueryOptions, Row, Serialize } from "./Types";
import { Table } from "./Table";

const __private__ = Symbol("private");

/**
 * Query class
 */
export class Query<S extends Serialize, K extends keyof S> {
	private [__private__]: QueryOptions<S> = {
		wheres: [],
		order: [],
		columns: [],
	};

	/**
	 * Create a query
	 * @param table The table for consuming the query
	 */
	constructor(private readonly table: Table<S>) {}

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
	where<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S, K>;
	where<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S, K>;
	where<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S, K>;
	where<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S, K>;
	where<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S, K>;
	where(column: string, operator: Operator, compare: any): Query<S, K> {
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
	filter<C extends keyof S>(column: C, operator: "=" | "!=", compare: S[C]["type"]): Query<S, K>;
	filter<C extends keyof S>(column: C, operator: ">" | "<" | ">=" | "<=", compare: S[C]["type"]): Query<S, K>;
	filter<C extends keyof S>(column: C, operator: "BETWEEN", compare: [S[C]["type"], S[C]["type"]]): Query<S, K>;
	filter<C extends keyof S>(column: C, operator: "LIKE", compare: S[C]["type"]): Query<S, K>;
	filter<C extends keyof S>(column: C, operator: "IN", compare: Array<S[C]["type"]>): Query<S, K>;
	filter(column: string, operator: Operator, compare: any): Query<S, K> {
		return this.where(column, operator as any, compare);
	}

	/**
	 * Take clause for the query
	 * @param take The number of rows to take
	 * @example
	 * query.take(10);
	 */
	take(take: number): Query<S, K> {
		this[__private__].take = take;
		return this;
	}

	/**
	 * Skip clause for the query
	 * @param skip The number of rows to skip
	 * @example
	 * query.skip(10);
	 */
	skip(skip: number): Query<S, K> {
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
	sort(column: string): Query<S, K>;
	sort(column: keyof S, ascending: boolean): Query<S, K>;
	sort(column: keyof S | string, ascending: boolean = true): Query<S, K> {
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
	order(column: keyof S): Query<S, K>;
	order(column: keyof S, ascending: boolean): Query<S, K>;
	order(column: keyof S | string, ascending: boolean = true): Query<S, K> {
		return this.sort(column, ascending);
	}

	/**
	 * Columns should return in selection
	 * @param columns The columns to select
	 * @example
	 * query.columns("id", "name");
	 */
	columns<C extends keyof S>(...columns: Array<C>): Query<S, K & C> {
		this[__private__].columns = [...this[__private__].columns, ...columns];
		return this;
	}

	/**
	 * Get the rows
	 * @param columns The columns to select
	 * @example
	 * query.get("id", "name");
	 */
	get<C extends keyof S>(...columns: Array<C>): Promise<Array<Row<S, K & C>>> {
		this.columns(...columns);
		return this.table.selectAll(this);
	}

	/**
	 * Get the first row
	 * @param columns The columns to select
	 * @example
	 * query.first("id", "name");
	 */
	first<C extends keyof S>(...columns: Array<C>): Promise<Row<S, K & C> | null> {
		this.columns(...columns);
		return this.table.selectFirst(this);
	}

	/**
	 * Get the last row
	 * @param columns The columns to select
	 * @example
	 * query.last("id", "name");
	 */
	last<C extends keyof S>(...columns: Array<C>): Promise<Row<S, K & C> | null> {
		this.columns(...columns);
		return this.table.selectLast(this);
	}

	/**
	 * Get one row
	 * @param columns The columns to select
	 * @example
	 * query.one("id", "name");
	 */
	one<C extends keyof S>(...columns: Array<C>): Promise<Row<S, K & C> | null> {
		this.columns(...columns);
		return this.table.selectOne(this);
	}

	/**
	 * Get the length of the rows
	 * @example
	 * query.length();
	 */
	length(): Promise<number> {
		return this.table.length(this);
	}

	/**
	 * Get the count of the rows
	 * @example
	 * query.count();
	 */
	count(): Promise<number> {
		return this.table.length(this);
	}

	/**
	 * Insert our update a row
	 * @param data The data to insert or update
	 * @example
	 * query.set({ id: 123, name: "hello" });
	 */
	async set(data: Partial<Row<S>>): Promise<void> {
		const exists = await this.table.exists(this);
		if (exists) {
			await this.table.update(data, this);
		} else {
			await this.table.insert(data);
		}
	}

	/**
	 * Update rows
	 * @param data The data to update
	 * @example
	 * query.update({ name: "world" });
	 */
	update(data: Partial<Row<S>>): Promise<void> {
		return this.table.update(data, this);
	}

	/**
	 * Delete rows
	 * @example
	 * query.delete();
	 */
	delete(): Promise<void> {
		return this.table.delete(this);
	}

	/**
	 * Check if a row exists
	 * @example
	 * query.exists();
	 */
	exists(): Promise<boolean> {
		return this.table.exists(this);
	}
}
