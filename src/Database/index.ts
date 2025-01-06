import { appExists, getApp, getServer } from "../App";
import { Tables, App, DatabaseSettings } from "../App/App";
import { Server } from "../App/Server";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { Database } from "./";
import { _database, _serialize, _tables } from "./internal";
import { Errors, ERROR_FACTORY } from "../Error";

export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";

interface DataBase<T extends Tables> {
	table<N extends keyof T>(name: N): Database.TableReady<T[keyof N]>;
}

export function getDatabase<T extends Tables>(): DataBase<T>;
export function getDatabase<T extends Tables>(dbname: string): DataBase<T>;
export function getDatabase<T extends Tables>(app: App | Server, dbname: string): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(options: DatabaseSettings<D>): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(app: App | Server, options: DatabaseSettings<D>): DataBase<T>;
export function getDatabase<T extends Tables, D = never>(app?: App | Server | DatabaseSettings<D> | string, dbname?: string | DatabaseSettings<D>): DataBase<T> {
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
				app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...dbname });
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

	return {
		table<N extends keyof T>(name: N) {
			let table: Database.TableReady<T[keyof N]>;

			if (_tables.has(`${dbname}_${String(name)}`)) {
				table = _tables.get(`${dbname}_${String(name)}`) as Database.TableReady<T[keyof N]>;
			} else {
				const serialize = _serialize.get(`${dbname}_${String(name)}`) as T[keyof N];
				table = database.table(String(name), serialize);
				_tables.set(`${dbname}_${String(name)}`, table);
			}

			return table;
		},
	};
}
