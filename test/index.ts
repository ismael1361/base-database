import Database from "../src";

type localDB = Map<string, any[]>;

class ModelDatabase extends Database.Custom<localDB> {
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
		throw new Error("Method not implemented.");
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

	insert(table: string, data: Database.Row): Promise<void> {
		return this.ready(async () => {
			const db = this.db.get(table) ?? [];
			db.push(data);
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

	createTable(table: string, columns: Database.SerializeDatatype<any>): Promise<void> {
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

const database = new Database.Database(ModelDatabase, "");
const table = database.readyTable("test", {
	integer: {
		type: Database.Types.INTEGER,
		primaryKey: true,
	},
	float: {
		type: Database.Types.FLOAT,
	},
	string: {
		type: Database.Types.TEXT,
		default: "",
		check(value: string) {
			if (typeof value !== "string") throw new Error("Invalid value");
		},
	},
	boolean: {
		type: Database.Types.BOOLEAN,
	},
	null: {
		type: Database.Types.NULL,
	},
	date: {
		type: Database.Types.DATETIME,
	},
	bigint: {
		type: Database.Types.BIGINT,
	},
});

type RowItem = Database.ExtractTableRow<(typeof table)["table"]>;

table.ready(async (table) => {
	console.log("table:", table.query().where("integer", "=", 0));
	const item = await table.query().where("integer", "=", 0).columns("bigint", "integer", "boolean").one();

	table
		.insert({
			integer: 0,
			float: 0.1,
			string: "",
			boolean: true,
			null: null,
			date: new Date(),
			bigint: BigInt(0),
		})
		.then();
});
