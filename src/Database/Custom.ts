import { ERROR_FACTORY, Errors } from "../Error";
import type { ColumnOptions, QueryOptions, Row, SerializeDataType } from "./Types";

/**
 * Custom database class
 */
export abstract class Custom<db = never> {
	/**
	 * If the database is disconnected
	 */
	private _disconnected: boolean = false;
	/**
	 * The database promise
	 */
	readonly database: Promise<db>;
	/**
	 * The database name
	 */
	private _databaseName: string = "";

	/**
	 * Create a custom database
	 * @param database The database name
	 */
	constructor() {
		this.database = this.connect();
	}

	/**
	 * Get the database name
	 */
	get databaseName(): string {
		return this._databaseName;
	}

	/**
	 * Set the database name
	 */
	set databaseName(value: string) {
		this._databaseName = value;
	}

	/**
	 * If the database is disconnected
	 */
	get disconnected(): boolean {
		return this._disconnected;
	}

	/**
	 * Set if the database is disconnected
	 */
	set disconnected(value: boolean) {
		this._disconnected = value;
		if (value) this.disconnect();
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
	async ready<R = never>(callback?: (db: db) => R | Promise<R>): Promise<R> {
		if (this._disconnected) throw ERROR_FACTORY.create("Database.Custom", Errors.DB_DISCONNECTED, { dbName: this.databaseName });
		const db = await this.database;
		return callback ? await callback(db) : (undefined as any);
	}

	/**
	 * Connect to the database
	 * @returns The database
	 * @example
	 * await custom.connect("my-database");
	 */
	abstract connect(): Promise<db>;

	/**
	 * Disconnect from the database
	 * @example
	 * await custom.disconnect();
	 */
	abstract disconnect(): Promise<void>;

	/**
	 * Select all rows from a table
	 * @param table The table name
	 * @param query The query
	 * @returns The rows
	 * @example
	 * await custom.selectAll("my-table", {
	 *    wheres: [{ column: "id", operator: "=", compare: 123 }],
	 *    columns: ["id", "name"],
	 * });
	 */
	abstract selectAll(table: string, query?: QueryOptions): Promise<Array<Row>>;

	/**
	 * Select one row from a table
	 * @param table The table name
	 * @param query The query
	 * @returns The row
	 * @example
	 * await custom.selectOne("my-table", {
	 *    wheres: [{ column: "id", operator: "=", compare: 123 }],
	 *    columns: ["id", "name"],
	 * });
	 */
	abstract selectOne(table: string, query?: QueryOptions): Promise<Row | null>;

	/**
	 * Select the first row from a table
	 * @param table The table name
	 * @param query The query
	 * @returns The row
	 * @example
	 * await custom.selectFirst("my-table", {
	 *    wheres: [{ column: "id", operator: "=", compare: 123 }],
	 *    columns: ["id", "name"],
	 *    order: [{ column: "id", ascending: true }],
	 * });
	 */
	abstract selectFirst(table: string, query?: QueryOptions): Promise<Row | null>;

	/**
	 * Select the last row from a table
	 * @param table The table name
	 * @param query The query
	 * @returns The row
	 * @example
	 * await custom.selectLast("my-table", {
	 *    wheres: [{ column: "id", operator: "=", compare: 123 }],
	 *    columns: ["id", "name"],
	 *    order: [{ column: "id", ascending: true }],
	 * });
	 */
	abstract selectLast(table: string, query?: QueryOptions): Promise<Row | null>;

	/**
	 * Insert a row into a table
	 * @param table The table name
	 * @param data The data to insert
	 * @example
	 * await custom.insert("my-table", { id: 123, name: "hello" });
	 */
	abstract insert(table: string, data: Row): Promise<Row>;

	/**
	 * Update rows in a table
	 * @param table The table name
	 * @param data The data to update
	 * @param query The query
	 * @example
	 * await custom.update("my-table", { name: "world" }, {
	 *   wheres: [{ column: "id", operator: "=", compare: 123 }],
	 * });
	 */
	abstract update(table: string, data: Partial<Row>, query: QueryOptions): Promise<void>;

	/**
	 * Delete rows from a table
	 * @param table The table name
	 * @param query The query
	 * @example
	 * await custom.delete("my-table", {
	 *   wheres: [{ column: "id", operator: "=", compare: 123 }],
	 * });
	 */
	abstract delete(table: string, query: QueryOptions): Promise<void>;

	/**
	 * Get the length of a table
	 * @param table The table name
	 * @param query The query
	 * @returns The length
	 * @example
	 * await custom.length("my-table", {
	 *   wheres: [{ column: "id", operator: "=", compare: 123 }],
	 * });
	 */
	abstract length(table: string, query?: QueryOptions): Promise<number>;

	/**
	 * Add a column in a table
	 * @param table The table name
	 * @param column The column name
	 * @param options The column options
	 * @example
	 * await custom.addColumn("my-table", "my-column", {
	 *     type: "TEXT",
	 *     notNull: true,
	 *     unique: true,
	 *     default: "hello",
	 * });
	 */
	abstract addColumn(table: string, column: string, options?: ColumnOptions): Promise<void>;

	/**
	 * Remove a column from a table
	 * @param table The table name
	 * @param column The column name
	 * @example
	 * await custom.remomoveColumn("my-table", "my-column");
	 */
	abstract remomoveColumn(table: string, column: string): Promise<void>;

	/**
	 * Create a table
	 * @param table The table name
	 * @param columns The columns to create
	 * @example
	 * await custom.createTable("my-table", {
	 *     id: { type: "INTEGER", primaryKey: true },
	 *     name: { type: "TEXT", notNull: true },
	 * });
	 */
	abstract createTable(table: string, columns: SerializeDataType<any>): Promise<void>;

	/**
	 * Get the SQL for a table
	 * @param table The table name
	 * @returns The SQL
	 * @example
	 * const sql = await custom.getTableSql("my-table");
	 * console.log(sql); // CREATE TABLE 'my-table' ( ...
	 */
	abstract getTableSql(table: string): Promise<string>;

	/**
	 * Delete a table
	 * @param table The table name
	 * @example
	 * await custom.deleteTable("my-table");
	 */
	abstract deleteTable(table: string): Promise<void>;

	/**
	 * Delete the database
	 * @example
	 * await custom.deleteDatabase();
	 */
	abstract deleteDatabase(): Promise<void>;
}
