import BasicEventEmitter from "basic-event-emitter";
import { Database } from "../Database";
import { DEFAULT_ENTRY_NAME } from "./internal";
import { _database, _serialize } from "../Database/internal";

export interface AppSettings {
	name?: string;
}

export type Tables = Record<PropertyKey, Database.Serialize>;

export interface DatabaseSettings<D = never> {
	name?: string;
	database: string;
	custom: Database.CustomConstructor<D>;
	tables: Tables;
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

	createDatabase<D = never>({ name = DEFAULT_ENTRY_NAME, database, custom, tables }: DatabaseSettings<D>): Tables {
		const db = new Database.Database(custom, database);
		_database.set(name, db);

		for (const [key, value] of Object.entries(tables)) {
			_serialize.set(`${name}_${key}`, value);
		}

		return tables;
	}
}
