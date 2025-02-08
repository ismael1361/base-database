import { appExists, getApp } from "../App";
import { App, DatabaseSettings } from "../App/App";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { Database } from "./";
import { _database, _serialize, _tables } from "./internal";
import { Errors, ERROR_FACTORY } from "../Error";
import { Row, RowDeserialize, TableType } from "./Types";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";

export * as Database from "./Database";

export type DatabaseTyping = {
	[DB: PropertyKey]: {
		[T: PropertyKey]: TableType;
	};
};

type TableEvents<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> = EventsListeners<{
	insert<N extends keyof T>(table: N, inserted: RowDeserialize<T[N], Row<T[N]>>): void;
	update<N extends keyof T>(table: N, updated: Array<RowDeserialize<T[N], Row<T[N]>>>, previous: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
	delete<N extends keyof T>(table: N, removed: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
}>;

export type DatabaseTables<D extends DatabaseTyping, DB extends keyof D, T extends D[DB] = D[DB]> = T;

interface DataBase<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> {
	ready<R = void>(callback?: (db: DataBase<D, DB, T>) => Promise<R>): Promise<R>;
	disconnect(): Promise<void>;
	tablesNames: Array<keyof T>;
	table<N extends keyof T>(name: N): Database.TableReady<T[N]>;
	deleteTable(name: keyof T): Promise<void>;
	on: BasicEventEmitter<TableEvents<D, DB>>["on"];
	once: BasicEventEmitter<TableEvents<D, DB>>["once"];
	off: BasicEventEmitter<TableEvents<D, DB>>["off"];
	offOnce: BasicEventEmitter<TableEvents<D, DB>>["offOnce"];
	deleteDatabase(): Promise<void>;
}

export function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME>(): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T>(dbname: DB): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME>(app: App): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T>(app: App, dbname: DB): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME, D = never>(options: DatabaseSettings<T, DB>): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME, D = never>(app: App, options: DatabaseSettings<T, DB>): DataBase<T, DB>;
export function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME, D = never>(
	app?: App | DatabaseSettings<T, DB> | DB,
	dbname?: DB | DatabaseSettings<T, DB>,
): DataBase<T, DB> {
	let database: Database.Database<any>;

	if (typeof app === "string") {
		dbname = app;
		app = undefined;
	}

	if (typeof app === "object") {
		if (app instanceof App) {
			app = app as App;

			if (typeof dbname === "string") {
				dbname = dbname as DB;
			} else if (typeof dbname === "object") {
				app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(dbname as any) });
			}
		} else {
			app = appExists() ? getApp() : undefined;
			app?.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(app as any) });
		}
	}

	dbname = (typeof dbname === "string" ? dbname : DEFAULT_ENTRY_NAME) as DB;
	app = (app as any) instanceof App ? app : appExists() ? getApp() : undefined;

	if (!_database.has(dbname as any)) {
		throw ERROR_FACTORY.create("getDatabase", Errors.DB_NOT_FOUND, { dbName: dbname as any });
	}

	database = _database.get(dbname as any) as Database.Database<any>;

	database.prepared = false;

	app = (app as any) instanceof App ? app : database.app;

	(app as any)?.ready(() => {
		database.prepared = true;
	});

	const events = new BasicEventEmitter<TableEvents<T, DB>>();

	return {
		tablesNames: [...database.tablesNames] as Array<keyof DatabaseTables<T, DB>>,
		async ready(callback) {
			return await database.ready(() => callback?.(this) ?? Promise.resolve(undefined as any));
		},
		async disconnect() {
			await database.disconnect();
			database.prepared = false;
			_database.delete(dbname as any);
			_serialize.forEach((value, key) => {
				if (key.startsWith(`${dbname as any}_`)) {
					_serialize.delete(key);
				}
			});
			_tables.forEach((value, key) => {
				if (key.startsWith(`${dbname as any}_`)) {
					_tables.delete(key);
				}
			});
		},
		table(name) {
			let table: Database.TableReady<any>;

			if (_tables.has(`${dbname as any}_${String(name)}`)) {
				table = _tables.get(`${dbname as any}_${String(name)}`) as Database.TableReady<any>;
			} else {
				const serialize = _serialize.get(`${dbname as any}_${String(name)}`) as any;
				table = database.table(String(name), serialize);
				_tables.set(`${dbname as any}_${String(name)}`, table);
			}

			table.on("insert", (inserted: any) => {
				events.emit("insert", name as any, inserted);
			});

			table.on("update", (updated: any, previous: any) => {
				events.emit("update", name as any, updated, previous);
			});

			table.on("delete", (removed: any) => {
				events.emit("delete", name as any, removed);
			});

			return table as any;
		},
		async deleteTable(name) {
			await database.deleteTable(String(name));
			database.tablesNames = database.tablesNames.filter((value) => value !== String(name));
			_serialize.delete(`${dbname as any}_${String(name)}`);
			_tables.delete(`${dbname as any}_${String(name)}`);
		},
		on: events.on.bind(events),
		once: events.once.bind(events),
		off: events.off.bind(events),
		offOnce: events.offOnce.bind(events),
		async deleteDatabase() {
			await this.disconnect();
			await database.deleteDatabase();
		},
	};
}
