import BasicEventEmitter, { BasicEventHandler } from "basic-event-emitter";
import { Row, Serialize, TableReady, TableType } from "./Types";
import { Custom } from "./Custom";
import { Table } from "./Table";
import { Query } from "./Query";
import { Errors, ERROR_FACTORY } from "../Error";
import type { App } from "../App/App";

export * from "./Utils";
export * from "./Types";
export * from "./Custom";
export * from "./Table";

/**
 * Database class
 */
export class Database<db = never> extends BasicEventEmitter<{
	ready: (db: Database<db>) => void;
	deleteTable: (name: string) => void;
	disconnect: () => void;
	delete: () => void;
}> {
	public app: App | undefined;
	/**
	 * The custom database class
	 */
	public custom: Custom<db>;
	/**
	 * The tables
	 */
	private tables: Map<string, Table<any>> = new Map();
	/**
	 * The tables names
	 */
	public tablesNames: Array<string> = [];

	/**
	 * Create a database
	 * @param custom The custom database class
	 * @param database The database name
	 * @example
	 * const database = new Database(CustomDatabase, "my-database");
	 */
	constructor(custom: Custom<db>, private database: string) {
		super();
		this.custom = null!;
		this.initialize(custom);
	}

	initialize(custom: Custom<db>) {
		this.prepared = false;

		this.custom = custom;
		this.custom.databaseName = this.database;

		this.tables.forEach((table) => {
			table.initialize(this.custom);
		});

		this.prepared = true;
	}

	/**
	 * The database is ready
	 * @param callback The callback
	 * @returns The promise
	 * @example
	 * await database.ready(() => {
	 *    // Code here will run when the database is ready
	 * });
	 */
	async ready<R = void>(callback?: (db: Database<db>) => Promise<R>): Promise<R> {
		await super.ready();
		return await this.custom.ready(() => callback?.(this) ?? Promise.resolve(undefined as any));
	}

	/**
	 * Disconnect from the database
	 * @example
	 * await database.disconnect();
	 */
	async disconnect(): Promise<void> {
		this.custom.disconnected = true;
		this.tables.forEach((table) => table.disconnect());
		this.tables.clear();
		this.emit("disconnect");
	}

	restartTable(name: string, columns: Serialize<any>) {
		if (this.tables.has(name)) {
			const table = this.tables.get(name)!;
			table.initialize(this.custom, columns);
		}
	}

	/**
	 * Get a table
	 * @param name The table name
	 * @param columns The columns
	 * @returns The table
	 * @example
	 * const table = await database.forTable("my-table", {
	 *    id: { type: Database.Types.INTEGER, primaryKey: true },
	 *    name: { type: Database.Types.TEXT, notNull: true },
	 *    date: { type: Database.Types.DATETIME },
	 * });
	 */
	async forTable<T extends TableType, O = Row<T>>(name: string, columns: Serialize<T>): Promise<Table<T, O>> {
		try {
			return await this.ready(() => {
				if (this.custom.disconnected) throw ERROR_FACTORY.create("Database.forTable", Errors.DB_DISCONNECTED, { dbName: this.database });

				let table = this.tables.get(name);
				if (!table) {
					table = new Table(this.custom, name, columns);
					this.tables.set(name, table);
					this.tablesNames = this.tablesNames.concat([name]).filter((value, index, self) => self.indexOf(value) === index);
				}
				return Promise.resolve(table as Table<T, O>);
			});
		} catch (e: any) {
			throw ERROR_FACTORY.create("Database.forTable", Errors.INTERNAL_ERROR, { message: "message" in e ? e.message : String(e) });
		}
	}

	/**
	 * Get a ready table
	 * @param table The table promise
	 * @returns The table ready
	 * @example
	 * const table = database.readyTable("my-table", {
	 *   id: { type: Database.Types.INTEGER, primaryKey: true },
	 *   name: { type: Database.Types.TEXT, notNull: true },
	 *   date: { type: Database.Types.DATETIME },
	 * });
	 *
	 * await table.ready(async (table) => {
	 *   // Code here will run when the table is ready
	 * });
	 *
	 * @example
	 * const table = database.forTable("my-table", {
	 *   id: { type: Database.Types.INTEGER, primaryKey: true },
	 *   name: { type: Database.Types.TEXT, notNull: true },
	 *   date: { type: Database.Types.DATETIME },
	 * });
	 *
	 * database.readyTable(table).ready(async (table) => {
	 *   // Code here will run when the table is ready
	 * });
	 */
	readyTable<T extends TableType, O = Row<T>>(table: Promise<Table<T, O>>): TableReady<T, O>;
	readyTable<T extends TableType, O = Row<T>>(name: string, columns: Serialize<T>): TableReady<T, O>;
	readyTable<T extends TableType, O = Row<T>>(name: string | Promise<Table<T, O>>, columns?: Serialize<T>): TableReady<T, O> {
		const table: any =
			typeof name === "string" && this.tables.has(name)
				? Promise.resolve(this.tables.get(name) as Table<T, O>)
				: typeof name === "string" && columns
				? this.forTable<T, O>(name, columns!)
				: name instanceof Promise
				? name
				: Promise.reject(
						ERROR_FACTORY.create("Database.readyTable", Errors.INVALID_ARGUMENT, { message: "Valid arguments: (name: string, columns: Serialize) or (table: Promise<Table<S, O>>)" }),
				  );
		const self = this;

		return {
			table,

			async ready(callback) {
				const t = await this.table;
				if (!t) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return t.ready(callback);
			},

			query() {
				return new Query(this.table);
			},

			async insert(data) {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.insert(data));
			},

			async selectAll() {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.selectAll());
			},

			async selectOne() {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.selectOne());
			},

			async selectFirst() {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.selectFirst());
			},

			async selectLast() {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.selectLast());
			},

			async length() {
				if (!this.table) throw ERROR_FACTORY.create("Database.readyTable", Errors.DB_TABLE_NOT_FOUND, { dbName: self.database, tableName: typeof name === "string" ? name : "" });
				return await this.table.then((t) => t.length());
			},

			on(name: any, callback: any): BasicEventHandler {
				this.table.then((t) => t.on(name, callback));
				const self = this;

				return {
					remove() {
						self.table.then((t) => t.off(name, callback));
					},
					stop() {
						this.remove();
					},
				};
			},

			async once(name: any, callback: any) {
				return await this.table.then((t) => t.once(name, callback));
			},

			off(name: any, callback: any) {
				this.table.then((t) => t.off(name, callback));
			},

			offOnce(name: any, callback: any) {
				this.table.then((t) => t.offOnce(name, callback));
			},

			schema(schema, options) {
				const t = this.table.then((t) => t.bindSchema(schema, options));
				return Object.create(this, { table: { value: t } });
			},
		};
	}

	/**
	 * Get a table
	 * @param name The table name
	 * @param columns The columns
	 * @returns The table
	 * @example
	 * const table = database.table("my-table", {
	 *   id: { type: Database.Types.INTEGER, primaryKey: true },
	 *   name: { type: Database.Types.TEXT, notNull: true },
	 *   date: { type: Database.Types.DATETIME },
	 * });
	 *
	 * table.ready(async (table) => {
	 *   // Code here will run when the table is ready
	 * });
	 *
	 * table.query().where("id", Database.Operators.EQUAL, 123).get("id", "name");
	 */
	table<T extends TableType>(name: string, columns: Serialize<T>): TableReady<T> {
		return this.readyTable(name, columns);
	}

	/**
	 * Delete a table
	 * @param name The table name
	 * @returns A promise that resolves when the table is deleted
	 * @throws If the database is disconnected
	 * @example
	 * await database.deleteTable("my-table");
	 */
	async deleteTable(name: string): Promise<void> {
		try {
			return await this.ready(async () => {
				if (this.custom.disconnected) throw ERROR_FACTORY.create("Database.deleteTable", Errors.DB_DISCONNECTED, { dbName: this.database });
				await this.custom.deleteTable(name);
				this.tables.delete(name);
				this.tablesNames = this.tablesNames.filter((value) => value !== name);
				this.emit("deleteTable", name);
			});
		} catch (e: any) {
			throw ERROR_FACTORY.create("Database.deleteTable", Errors.INTERNAL_ERROR, { message: "message" in e ? e.message : String(e) });
		}
	}

	/**
	 * Delete the database
	 * @returns A promise that resolves when the database is deleted
	 * @throws If the database is disconnected
	 * @example
	 * await database.deleteDatabase();
	 */
	async deleteDatabase(): Promise<void> {
		// if (this.custom.disconnected) throw ERROR_FACTORY.create("Database.deleteTable", Errors.DB_DISCONNECTED, { dbName: this.database });
		try {
			this.custom.disconnected = true;
			await this.custom.deleteDatabase();
			this.tables.forEach((table) => table.disconnect());
			this.tables.clear();
			this.tablesNames = [];
			this.emit("delete");
		} catch (e: any) {
			throw ERROR_FACTORY.create("Database.deleteDatabase", Errors.INTERNAL_ERROR, { message: "message" in e ? e.message : String(e) });
		}
	}
}
