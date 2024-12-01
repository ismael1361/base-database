import { Row, SerializeDatatype, Wheres } from "./Types";

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
	 * Create a custom database
	 * @param database The database name
	 */
	constructor(database: string) {
		this.database = this.connect(database);
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
		if (this._disconnected) throw new Error("Database is disconnected");
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
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The rows
	 * @example
	 * await custom.selectAll("my-table", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectAll<C>(table: string, columns?: Array<C>, where?: Wheres): Promise<Array<Row>>;

	/**
	 * Select one row from a table
	 * @param table The table name
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectOne("my-table", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectOne<C>(table: string, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Select the first row from a table
	 * @param table The table name
	 * @param by The column to select
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectFirst("my-table", "id", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectFirst<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Select the last row from a table
	 * @param table The table name
	 * @param by The column to select
	 * @param columns The columns to select
	 * @param where The where clause
	 * @returns The row
	 * @example
	 * await custom.selectLast("my-table", "id", ["id", "name"], [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract selectLast<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Wheres): Promise<Row | null>;

	/**
	 * Insert a row into a table
	 * @param table The table name
	 * @param data The data to insert
	 * @example
	 * await custom.insert("my-table", { id: 123, name: "hello" });
	 */
	abstract insert(table: string, data: Row): Promise<void>;

	/**
	 * Update rows in a table
	 * @param table The table name
	 * @param data The data to update
	 * @param where The where clause
	 * @example
	 * await custom.update("my-table", { name: "world" }, [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract update(table: string, data: Partial<Row>, where: Wheres): Promise<void>;

	/**
	 * Delete rows from a table
	 * @param table The table name
	 * @param where The where clause
	 * @example
	 * await custom.delete("my-table", [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract delete(table: string, where: Wheres): Promise<void>;

	/**
	 * Get the length of a table
	 * @param table The table name
	 * @param where The where clause
	 * @returns The length
	 * @example
	 * await custom.length("my-table", [{ column: "id", operator: "=", value: 123 }]);
	 */
	abstract length(table: string, where?: Wheres): Promise<number>;

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
	abstract createTable(table: string, columns: SerializeDatatype<any>): Promise<void>;

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
