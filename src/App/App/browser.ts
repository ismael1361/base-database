import BasicEventEmitter from "basic-event-emitter";
import * as Database from "../../Database/Database";
import type { DatabaseTables, DatabaseTyping } from "../../Database";
import { DEFAULT_ENTRY_NAME } from "../internal";
import { _database, _serialize, _tables } from "../../Database/internal";

export interface AppSettings {
	name?: PropertyKey;
}

export interface DatabaseSettings {
	storage: {
		custom: Database.CustomConstructor<any>;
		config: any;
	};
	tables: Record<PropertyKey, Database.Serialize<any>>;
}

export class App extends BasicEventEmitter<{
	createDatabase(name: string, options: DatabaseSettings): void;
}> {
	readonly isServer: boolean = false;
	readonly name: PropertyKey;
	public isDeleted: boolean = false;

	constructor(readonly settings: AppSettings, initialize: boolean = true) {
		super();
		this.name = settings.name ?? DEFAULT_ENTRY_NAME;

		if (initialize) this.initialize();
	}

	initialize() {
		this.prepared = true;
	}

	createDatabase(options: DatabaseSettings): Record<PropertyKey, Database.Serialize<any>>;
	createDatabase(name: string, options: DatabaseSettings): Record<PropertyKey, Database.Serialize<any>>;
	createDatabase(name: string | DatabaseSettings, options?: DatabaseSettings): Record<PropertyKey, Database.Serialize<any>> {
		options = (typeof name === "string" ? options : name) as DatabaseSettings;
		name = (typeof name === "string" ? name : DEFAULT_ENTRY_NAME) as string;

		const { storage, tables } = options as DatabaseSettings;

		let db: Database.Database<any>;

		if (_database.has(name as any)) {
			db = _database.get(name as any)!;
			db.initialize(storage.custom, storage.config);
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

		this.emit("createDatabase", String(name), options as DatabaseSettings);
		return tables as any;
	}
}
