import BasicEventEmitter, { BasicEventHandler } from "basic-event-emitter";
import { Row, Serialize } from "./Types";
import { Custom } from "./Custom";
import { Table } from "./Table";
import { Query } from "./Query";

export * from "./Types";
export * from "./Utils";
export * from "./Custom";
export * from "./Table";

/**
 * Define type for custom database constructor
 */
export type CustomConstructor<db = never> = new (database: string) => Custom<db>;

export type TableReady<S extends Serialize> = {
	table: Promise<Table<S> | undefined>;
	ready: <T = void>(callback: (table: Table<S>) => T | Promise<T>) => Promise<T>;
	query: () => Query<S>;
	insert: (data: Partial<Row<S>>) => Promise<void>;
	on: Table<S>["on"];
	once: Table<S>["once"];
	off: (...args: Parameters<Table<S>["off"]>) => void;
	offOnce: (...args: Parameters<Table<S>["offOnce"]>) => void;
};

/**
 * Database class
 */
export class Database<db = never> extends BasicEventEmitter<{
	ready: (db: Database<db>) => void;
	deleteTable: (name: string) => void;
	disconnect: () => void;
	delete: () => void;
}> {
	/**
	 * The custom database class
	 */
	readonly custom: Custom<db>;
	/**
	 * The tables
	 */
	private tables: Map<string, Table<any>> = new Map();

	/**
	 * Create a database
	 * @param custom The custom database class
	 * @param database The database name
	 * @example
	 * const database = new Database(CustomDatabase, "my-database");
	 */
	constructor(custom: CustomConstructor<db>, readonly database: string) {
		super();
		this.custom = new custom(database);
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
		return this.custom.ready(() => callback?.(this) ?? Promise.resolve(undefined as any));
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
	forTable<S extends Serialize>(name: string, columns: S): Promise<Table<S>> {
		return this.ready(() => {
			if (this.custom.disconnected) throw new Error("Database is disconnected");

			let table = this.tables.get(name);
			if (!table) {
				table = new Table(this.custom, name, columns);
				this.tables.set(name, table);
			}
			return Promise.resolve(table as Table<S>);
		});
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
	readyTable<S extends Serialize>(table: Promise<Table<S>>): TableReady<S>;
	readyTable<S extends Serialize>(name: string, columns: S): TableReady<S>;
	readyTable<S extends Serialize>(name: string | Promise<Table<S>>, columns?: S): TableReady<S> {
		const table =
			typeof name === "string" && this.tables.has(name)
				? Promise.resolve(this.tables.get(name) as Table<S>)
				: typeof name === "string" && columns
				? this.forTable(name, columns!)
				: name instanceof Promise
				? name
				: Promise.reject(new Error("Invalid arguments"));

		return {
			table,

			async ready(callback) {
				const t = await table;
				if (!t) throw new Error("Table not found");
				return t.ready(callback);
			},

			query() {
				if (!table) throw new Error("Table not found");
				return new Query(table);
			},

			async insert(data) {
				if (!table) throw new Error("Table not found");
				return await table.then((t) => t.insert(data));
			},

			on(name: any, callback: any): BasicEventHandler {
				table.then((t) => t.on(name, callback));

				return {
					remove() {
						table.then((t) => t.off(name, callback));
					},
					stop() {
						this.remove();
					},
				};
			},

			async once(name: any, callback: any) {
				return await table.then((t) => t.once(name, callback));
			},

			off(name: any, callback: any) {
				table.then((t) => t.off(name, callback));
			},

			offOnce(name: any, callback: any) {
				table.then((t) => t.offOnce(name, callback));
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
	table<S extends Serialize>(name: string, columns: S): TableReady<S> {
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
	deleteTable(name: string): Promise<void> {
		return this.ready(async () => {
			if (this.custom.disconnected) throw new Error("Database is disconnected");
			await this.custom.deleteTable(name);
			this.tables.delete(name);
			this.emit("deleteTable", name);
		});
	}

	/**
	 * Delete the database
	 * @returns A promise that resolves when the database is deleted
	 * @throws If the database is disconnected
	 * @example
	 * await database.deleteDatabase();
	 */
	async deleteDatabase(): Promise<void> {
		// if (this.custom.disconnected) throw new Error("Database is disconnected");
		this.custom.disconnected = true;
		await this.custom.deleteDatabase();
		this.tables.forEach((table) => table.disconnect());
		this.tables.clear();
		this.emit("delete");
	}
}
