import BasicEventEmitter from "basic-event-emitter";
import * as Database from "../../Database/Database";
import type { DatabaseTables, DatabaseTyping } from "../../Database";
import { DEFAULT_ENTRY_NAME } from "../internal";
import { _database, _serialize, _tables } from "../../Database/internal";

export interface AppSettings {
	name?: string;
}

// export type Tables<T extends Record<PropertyKey, Database.Serialize> = Record<PropertyKey, Database.Serialize>> = {
// 	[K in keyof T]: T[K];
// };

type SimplifyTableTypes<T extends Database.TableType, S extends Database.Serialize<T> = Database.Serialize<T>> = {
	[K in keyof S]: Omit<S[K], "type"> & { type: S[K]["type"] extends string ? string : S[K]["type"] };
};

type SimplifyTablesTypes<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> = {
	[K in keyof T]: SimplifyTableTypes<T[K]>;
};

export interface DatabaseSettings<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> {
	storage: {
		custom: Database.CustomConstructor<any>;
		config: any;
	};
	tables: SimplifyTablesTypes<D, DB, T>;
}

export class App extends BasicEventEmitter<{
	createDatabase(name: string, options: DatabaseSettings<any, any>): void;
}> {
	readonly isServer: boolean = false;
	readonly name: string;
	public isDeleted: boolean = false;

	constructor(readonly settings: AppSettings, initialize: boolean = true) {
		super();
		this.name = settings.name ?? DEFAULT_ENTRY_NAME;

		if (initialize) this.initialize();
	}

	initialize() {
		this.prepared = true;
	}

	createDatabase<D extends DatabaseTyping, DB extends keyof D = typeof DEFAULT_ENTRY_NAME, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>>(options: DatabaseSettings<D, DB, T>): T;
	createDatabase<D extends DatabaseTyping, DB extends keyof D = typeof DEFAULT_ENTRY_NAME, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>>(name: DB, options: DatabaseSettings<D, DB, T>): T;
	createDatabase<D extends DatabaseTyping, DB extends keyof D = typeof DEFAULT_ENTRY_NAME, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>>(
		name: DB | DatabaseSettings<D, DB, T>,
		options?: DatabaseSettings<D, DB, T>,
	): T {
		options = (typeof name === "string" ? options : name) as DatabaseSettings<D, DB, T>;
		name = (typeof name === "string" ? name : DEFAULT_ENTRY_NAME) as DB;

		const { storage, tables } = options as DatabaseSettings<D, DB, T>;

		let db: Database.Database<any>;

		if (_database.has(name as any)) {
			db = _database.get(name as any)!;
			db.initialize(storage.custom, name as any, storage.config);
		} else {
			db = new Database.Database(storage.custom, name as any, storage.config);
			db.app = this;
			db.tablesNames = Object.keys(tables);
			_database.set(name as any, db);
		}

		for (const [key, value] of Object.entries(tables)) {
			_serialize.set(`${name as any}_${key}`, value as any);
			if (_tables.has(`${name as any}_${key}`)) {
				const table = _tables.get(`${name as any}_${key}`)!;
				table.table.then((table) => table.initialize(db.custom, value as any));
			}
		}

		this.emit("createDatabase", name as any, options as DatabaseSettings<D, DB, T>);
		return tables as any;
	}
}
