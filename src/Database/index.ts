import { appExists, getApp, getServer } from "../App";
import { Tables, App, DatabaseSettings } from "../App/App";
import { Server } from "../App/Server";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { Database } from "./";
import { _database, _serialize, _tables } from "./internal";
import { Errors, ERROR_FACTORY } from "../Error";
import { Row, RowDeserialize, Serialize } from "./Types";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";

export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";

type TableEvents<T extends Tables> = EventsListeners<{
	insert<N extends keyof T>(table: N, inserted: RowDeserialize<T[N], Row<T[N]>>): void;
	update<N extends keyof T>(table: N, updated: Array<RowDeserialize<T[N], Row<T[N]>>>, previous: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
	delete<N extends keyof T>(table: N, removed: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
}>;

interface DataBase<T extends Tables> {
	ready<R = void>(callback?: (db: DataBase<T>) => Promise<R>): Promise<R>;
	disconnect(): Promise<void>;
	tablesNames: Array<keyof T>;
	table<N extends keyof T>(name: N): Database.TableReady<T[N]>;
	deleteTable(name: keyof T): Promise<void>;
	on: BasicEventEmitter<TableEvents<T>>["on"];
	once: BasicEventEmitter<TableEvents<T>>["once"];
	off: BasicEventEmitter<TableEvents<T>>["off"];
	offOnce: BasicEventEmitter<TableEvents<T>>["offOnce"];
	deleteDatabase(): Promise<void>;
}

export function getDatabase<T extends Tables>(): DataBase<T>;
export function getDatabase<T extends Tables>(dbname: string): DataBase<T>;
export function getDatabase<T extends Tables>(app: App | Server): DataBase<T>;
export function getDatabase<T extends Tables>(app: App | Server, dbname: string): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(options: DatabaseSettings<T, D>): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(app: App | Server, options: DatabaseSettings<T, D>): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(app?: App | Server | DatabaseSettings<T, D> | string, dbname?: string | DatabaseSettings<T, D>): DataBase<T> {
	let database: Database.Database<any>;

	if (typeof app === "string") {
		dbname = app;
		app = undefined;
	}

	if (typeof app === "object") {
		if (app instanceof App || app instanceof Server) {
			app = app as App | Server;

			if (typeof dbname === "string") {
				dbname = dbname as string;
			} else if (typeof dbname === "object") {
				app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(dbname as any) });
			}
		} else {
			app = appExists() ? getApp() : getServer();
			app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...(app as any) });
		}
	}

	dbname = typeof dbname === "string" ? dbname : DEFAULT_ENTRY_NAME;
	app = (app as any) instanceof App || (app as any) instanceof Server ? app : appExists() ? getApp() : getServer();

	if (!_database.has(dbname)) {
		throw ERROR_FACTORY.create(Errors.DB_NOT_FOUND, { dbName: dbname });
	}

	database = _database.get(dbname) as Database.Database<any>;

	database.prepared = false;

	app?.ready(() => {
		database.prepared = true;
	});

	const events = new BasicEventEmitter<TableEvents<T>>();

	return {
		tablesNames: [...database.tablesNames] as Array<keyof T>,
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
				events.emit("insert", name, inserted);
			});

			table.on("update", (updated: any, previous: any) => {
				events.emit("update", name, updated, previous);
			});

			table.on("delete", (removed: any) => {
				events.emit("delete", name, removed);
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
