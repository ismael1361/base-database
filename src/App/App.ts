import { Database } from "../Database";
import { DEFAULT_ENTRY_NAME } from "./internal";

export interface AppSettings {
	readonly name?: string;
}

export interface DatabaseSettings<D = never> {
	readonly name?: string;
	readonly database: string;
	readonly custom: Database.CustomConstructor<D>;
}

export class App {
	readonly isServer: boolean = false;
	readonly name: string;
	public isDeleted: boolean = false;
	private _database: Map<string, Database.Database<any>> = new Map();

	constructor(readonly settings: AppSettings) {
		this.name = settings.name ?? DEFAULT_ENTRY_NAME;
	}

	initialize() {}

	createDatabase<D = never>({ name = DEFAULT_ENTRY_NAME, database, custom }: DatabaseSettings<D>) {
		const db = new Database.Database(custom, database);
		this._database.set(name, db);
	}
}
