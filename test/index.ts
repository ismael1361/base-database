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
	public integer: number;
	public float: number;
	public string: string;
	public boolean: boolean;
	public name: null;
	public date: Date;
	public bigint: bigint;

	constructor(row: Database.Row<typeof testColumns>) {
		this.integer = row.integer;
		this.float = row.float;
		this.string = row.string;
		this.boolean = row.boolean;
		this.name = row.null;
		this.date = row.date;
		this.bigint = row.bigint;
	}

	serialize(): Partial<Database.Row<typeof testColumns>> {
		return {
			integer: this.integer,
			float: this.float,
			string: this.string,
			boolean: this.boolean,
			null: this.name,
			date: this.date,
			bigint: this.bigint,
		};
	}
}

const test = database.table("test", testColumns);

test.on("insert", (row) => {
	console.log("insert", row);
});

const TestTable = test.schema(Test);

TestTable.on("insert", (row) => {
	console.log("insert schema", row);
});

test.ready(async (table) => {
	const query = table.query().where("integer", "=", 0).columns("bigint", "integer", "boolean");

	// console.log("0::", await query.get());

	await table.insert({ integer: 0, float: 0, string: "", boolean: false, null: null, date: new Date(), bigint: BigInt(0) });
	await table.insert({ integer: 1, float: 1, string: "", boolean: false, null: null, date: new Date(), bigint: BigInt(1) });

	// console.log("0::", await query.get());
});

TestTable.ready(async (table) => {
	const query = table.query().where("integer", "=", 0).columns("bigint", "integer", "boolean");

	// console.log("1::", await query.get());

	await table.insert(new Test({ integer: 2, float: 2, string: "", boolean: false, null: null, date: new Date(), bigint: BigInt(0) }));
	await table.insert(new Test({ integer: 3, float: 3, string: "", boolean: false, null: null, date: new Date(), bigint: BigInt(1) }));

	// console.log("1::", await query.get());
});

// const table = database.table("table", testColumns);

// table.insert({
// 	integer: 0,
// 	float: 0,
// 	string: "",
// 	boolean: false,
// 	null: null,
// });

// table.ready(async (table) => {
// 	const q = table.query();
// 	const query = q.where("integer", "=", 0).columns("bigint", "integer", "boolean");

// 	console.log("2::", await query.get());

// 	await table.insert({
// 		integer: 1,
// 		float: 1,
// 		string: "",
// 		boolean: false,
// 		null: null,
// 	});

// 	console.log("2::", await query.get());
// });
