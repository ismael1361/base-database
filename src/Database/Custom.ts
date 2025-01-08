import { ERROR_FACTORY, Errors } from "../Error";
import { QueryOptions, Row, SerializeDataType } from "./Types";

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
	private readonly _databaseName: string;

	/**
	 * Create a custom database
	 * @param database The database name
	 */
	constructor(database: string) {
		this._databaseName = database;
		this.database = this.connect(database);
	}

	/**
	 * Get the database name
	 */
	get databaseName(): string {
		return this._databaseName;
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
	 * @param database The database name
	 * @returns The database
	 * @example
	 * await custom.connect("my-database");
	 */
	abstract connect(database: string): Promise<db>;

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
