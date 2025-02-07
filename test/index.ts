import { Database, initializeApp, getDatabase, Server, DEFAULT_ENTRY_NAME } from "../src";
import { ModelDatabase } from "./DB";
import { SQLite } from "./SQLite";

const app = new Server({ name: DEFAULT_ENTRY_NAME });

const server = app.createServer();

server.listen(3000, () => {
	console.log("Server running on http://localhost:3000 🚀");
});

type DatabaseTyping = {
	[DEFAULT_ENTRY_NAME]: {
		myTable: {
			name: string;
			createdAt: Date;
			gender: "Female" | "Male" | "Other";
			amount: number;
		};
	};
};

const db = app.createDatabase<DatabaseTyping>({
	database: ":memory:",
	storage: { custom: SQLite, config: {} },
	tables: {
		myTable: {
			name: {
				type: Database.Types.TEXT,
			},
			createdAt: {
				type: Database.Types.DATETIME,
				default: () => new Date(),
			},
			gender: {
				type: Database.Types.TEXT,
				options: ["Female", "Male", "Other"] as const,
			},
			amount: {
				type: Database.Types.INTEGER,
			},
		},
	},
});

// type MainDatabase = typeof db;

const myTable = getDatabase<DatabaseTyping>().table("myTable");

myTable.ready(async (table) => {
	await table.insert([
		{ name: "Maria", gender: "Female", createdAt: new Date(), amount: 5 },
		{ name: "João", gender: "Male" },
		{ name: "Pedro", gender: "Male" },
		{ name: "Martha", gender: "Female" },
	]);
});

// class Test {
// 	public name: string;
// 	public createdAt: Date;
// 	public gender: "Female" | "Male" | "Other";

// 	constructor(row: Partial<Database.Row<(typeof myTable)>>) {
// 		this.name = row.name ?? "";
// 		this.createdAt = row.createdAt ?? new Date();
// 		this.gender = row.gender ?? "Other";
// 	}

// 	serialize(): Partial<Database.Row<(typeof myDb)["myTable"]>> {
// 		return {
// 			name: this.name,
// 			createdAt: this.createdAt,
// 			gender: this.gender,
// 		};
// 	}
// }

// const TestTable = getDatabase().table("myTable").schema(Test);

// TestTable.on("insert", (row) => {
// 	console.log("insert schema", row);
// });

// TestTable.ready(async (table) => {
// 	const query = table.query().where("name", "LIKE", /^(m)/i);

// 	await table.insert([
// 		new Test({ name: "Maria", gender: "Other",  }),
// 		new Test({ name: "João", gender: "Male" }),
// 		new Test({ name: "Pedro", gender: "Male" }),
// 		new Test({ name: "Martha", gender: "Female" }),
// 	]);

// 	console.log("query::", await query.get());
// });
