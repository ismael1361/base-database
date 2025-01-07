import BasicEventEmitter from "basic-event-emitter";
import { Database } from "../Database";
import { DEFAULT_ENTRY_NAME } from "./internal";
import { _database, _serialize } from "../Database/internal";

export interface AppSettings {
	name?: string;
}

export type Tables<T extends Record<PropertyKey, Database.Serialize> = Record<PropertyKey, Database.Serialize>> = {
	[K in keyof T]: T[K];
};

export interface DatabaseSettings<T extends Tables, D = never> {
	database: string;
	custom: Database.CustomConstructor<D>;
	tables: T;
}

export class App extends BasicEventEmitter<{}> {
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

	createDatabase<T extends Tables, D = never>(options: DatabaseSettings<T, D>): T;
	createDatabase<T extends Tables, D = never>(name: string, options: DatabaseSettings<T, D>): T;
	createDatabase<T extends Tables, D = never>(name: string | DatabaseSettings<T, D>, options?: DatabaseSettings<T, D>): T {
		options = typeof name === "string" ? options : name;
		name = typeof name === "string" ? name : DEFAULT_ENTRY_NAME;

		const { database, custom, tables } = options as DatabaseSettings<T, D>;

		const db = new Database.Database(custom, database);
		db.tablesNames = Object.keys(tables);
		_database.set(name, db);

		for (const [key, value] of Object.entries(tables)) {
			_serialize.set(`${name}_${key}`, value);
		}

		return tables;
	}
}
