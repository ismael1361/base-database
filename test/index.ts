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

const database = new Database.Database(ModelDatabase, "");

const testColumns = Database.columns({
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

class Test {
	constructor(public integer: number, public float: number, public string: string, public boolean: boolean, public _null: null, public date: Date, public bigint: bigint) {}

	serialize(): Partial<Database.Row<typeof testColumns>> {
		return {
			integer: this.integer,
			float: this.float,
			string: this.string,
			boolean: this.boolean,
			null: this._null,
			date: this.date,
			bigint: this.bigint,
		};
	}

	static create(row: Database.Row<typeof testColumns>): Test {
		return new Test(row.integer, row.float, row.string, row.boolean, row.null, row.date, row.bigint);
	}
}

const test = database.table("test", testColumns).schema(Test);

test.insert(new Test(0, 0, "", false, null, new Date(), BigInt(0)));

const table = database.table("table", testColumns);

table.insert({
	integer: 0,
	float: 0,
	string: "",
	boolean: false,
	null: null,
});

table.ready(async (table) => {
	const q = table.query();
	const query = q.where("integer", "=", 0).columns("bigint", "integer", "boolean");

	console.log(await query.get());

	await table.insert({
		integer: 0,
		float: 0,
		string: "",
		boolean: false,
		null: null,
	});

	console.log(await query.get());
});
