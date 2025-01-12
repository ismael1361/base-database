import { appExists, getApp, getServer } from "../App";
import { Tables, App, DatabaseSettings } from "../App/App";
import { Server } from "../App/Server";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { Database } from "./";
import { _database, _serialize, _tables } from "./internal";
import { Errors, ERROR_FACTORY } from "../Error";
import { Row, RowDeserialize } from "./Types";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";

export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";

type TableEvents<DB extends keyof DatabaseTyping, T extends DatabaseTables<DB> = DatabaseTables<DB>> = EventsListeners<{
	insert<N extends keyof T>(table: N, inserted: RowDeserialize<T[N], Row<T[N]>>): void;
	update<N extends keyof T>(table: N, updated: Array<RowDeserialize<T[N], Row<T[N]>>>, previous: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
	delete<N extends keyof T>(table: N, removed: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
}>;

type RemoveNullable<T> = T extends null | undefined ? null : T extends Database.SerializeValueType ? T : null;

type RemoveNullableFromObject<T> = {
	[K in keyof T]: RemoveNullable<T[K]>;
};

type DatabaseTable<DB extends keyof DatabaseTyping, T extends DatabaseTyping[DB], N extends keyof T, C extends RemoveNullableFromObject<T[N]> = RemoveNullableFromObject<T[N]>> = Database.Serialize<{
	[K in keyof C]: Database.SerializeItemAny<C[K]>;
}>;

type DatabaseTables<DB extends keyof DatabaseTyping, T extends DatabaseTyping[DB] = DatabaseTyping[DB]> = {
	[K in keyof T]: DatabaseTable<DB, T, K>;
};

interface DataBase<DB extends keyof DatabaseTyping, T extends DatabaseTables<DB> = DatabaseTables<DB>> {
	ready<R = void>(callback?: (db: DataBase<DB, T>) => Promise<R>): Promise<R>;
	disconnect(): Promise<void>;
	tablesNames: Array<keyof T>;
	table<N extends keyof T>(name: N): Database.TableReady<T[N]>;
	deleteTable(name: keyof T): Promise<void>;
	on: BasicEventEmitter<TableEvents<DB>>["on"];
	once: BasicEventEmitter<TableEvents<DB>>["once"];
	off: BasicEventEmitter<TableEvents<DB>>["off"];
	offOnce: BasicEventEmitter<TableEvents<DB>>["offOnce"];
	deleteDatabase(): Promise<void>;
}

export function getDatabase<DB extends keyof DatabaseTyping = typeof DEFAULT_ENTRY_NAME>(): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping>(dbname: DB): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping = typeof DEFAULT_ENTRY_NAME>(app: App | Server): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping>(app: App | Server, dbname: DB): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping = typeof DEFAULT_ENTRY_NAME, D = never>(options: DatabaseSettings<any, D>): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping = typeof DEFAULT_ENTRY_NAME, D = never>(app: App | Server, options: DatabaseSettings<any, D>): DataBase<DB>;
export function getDatabase<DB extends keyof DatabaseTyping = typeof DEFAULT_ENTRY_NAME, D = never>(
	app?: App | Server | DatabaseSettings<any, D> | DB,
	dbname?: DB | DatabaseSettings<any, D>,
): DataBase<DB> {
	let database: Database.Database<any>;

	if (typeof app === "string") {
		dbname = app;
		app = undefined;
	}

	if (typeof app === "object") {
		if (app instanceof App || app instanceof Server) {
			app = app as App | Server;

			if (typeof dbname === "string") {
				dbname = dbname as DB;
			} else if (typeof dbname === "object") {
				app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(dbname as any) });
			}
		} else {
			app = appExists() ? getApp() : getServer();
			app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(app as any) });
		}
	}

	dbname = (typeof dbname === "string" ? dbname : DEFAULT_ENTRY_NAME) as DB;
	app = (app as any) instanceof App || (app as any) instanceof Server ? app : appExists() ? getApp() : getServer();

	if (!_database.has(dbname)) {
		throw ERROR_FACTORY.create("getDatabase", Errors.DB_NOT_FOUND, { dbName: dbname });
	}

	database = _database.get(dbname) as Database.Database<any>;

	database.prepared = false;

	app?.ready(() => {
		database.prepared = true;
	});

	const events = new BasicEventEmitter<TableEvents<DB>>();

	return {
		tablesNames: [...database.tablesNames] as Array<keyof DatabaseTables<DB>>,
		async ready(callback) {
			await super.ready();
			return await database.ready(() => callback?.(this) ?? Promise.resolve(undefined as any));
		},
		async disconnect() {
			await database.disconnect();
			database.prepared = false;
			_database.delete(dbname);
			_serialize.forEach((value, key) => {
				if (key.startsWith(`${dbname}_`)) {
					_serialize.delete(key);
				}
			});
			_tables.forEach((value, key) => {
				if (key.startsWith(`${dbname}_`)) {
					_tables.delete(key);
				}
			});
		},
		table(name) {
			let table: Database.TableReady<any>;

			if (_tables.has(`${dbname}_${String(name)}`)) {
				table = _tables.get(`${dbname}_${String(name)}`) as Database.TableReady<any>;
			} else {
				const serialize = _serialize.get(`${dbname}_${String(name)}`) as any;
				table = database.table(String(name), serialize);
				_tables.set(`${dbname}_${String(name)}`, table);
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

			return table;
		},
		async deleteTable(name) {
			await database.deleteTable(String(name));
			database.tablesNames = database.tablesNames.filter((value) => value !== String(name));
			_serialize.delete(`${dbname}_${String(name)}`);
			_tables.delete(`${dbname}_${String(name)}`);
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
