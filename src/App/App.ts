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
	name?: string;
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

	createDatabase<T extends Tables, D = never>({ name = DEFAULT_ENTRY_NAME, database, custom, tables }: DatabaseSettings<T, D>): T {
		const db = new Database.Database(custom, database);
		_database.set(name, db);

		for (const [key, value] of Object.entries(tables)) {
			_serialize.set(`${name}_${key}`, value);
		}

		return tables;
	}
}
