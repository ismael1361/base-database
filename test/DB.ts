import Database from "../src";

type localDB = Map<string, any[]>;

export class ModelDatabase extends Database.Custom<localDB> {
	private db: localDB;

	constructor(database: string) {
		super(database);
		this.db = new Map();
	}

	connect(database: string): Promise<localDB> {
		return Promise.resolve(this.db);
	}

	disconnect(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
		return this.ready(async () => {
			return this.db.get(table) ?? [];
		});
	}

	selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		throw new Error("Method not implemented.");
	}

	selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		throw new Error("Method not implemented.");
	}

	selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		throw new Error("Method not implemented.");
	}

	insert(table: string, data: Database.Row): Promise<Database.Row> {
		return this.ready(async () => {
			const db = this.db.get(table) ?? [];
			db.push(data);
			this.db.set(table, db);
			return db[db.length - 1];
		});
	}

	update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	delete(table: string, query: Database.QueryOptions): Promise<void> {
		throw new Error("Method not implemented.");
	}

	length(table: string, query?: Database.QueryOptions): Promise<number> {
		throw new Error("Method not implemented.");
	}

	createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void> {
		return this.ready(async () => {
			this.db.set(table, []);
		});
	}

	deleteTable(table: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	deleteDatabase(): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
