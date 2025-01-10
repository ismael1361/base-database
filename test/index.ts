import { Database, initializeApp, getDatabase, initializeServer } from "../src";
import { ModelDatabase } from "./DB";
import { SQLite } from "./SQLite";

const app = initializeServer();

const server = app.createServer();

server.listen(3000, () => {
	console.log("Server running on http://localhost:3000 🚀");
});

const db = app.createDatabase({
	database: ":memory:",
	storage: SQLite,
	tables: {
		myTable: Database.columns({
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
		}),
	},
});

// type MainDatabase = typeof db;

// class Test {
// 	public name: string;
// 	public createdAt: Date;
// 	public gender: "Female" | "Male" | "Other";

// 	constructor(row: Partial<Database.Row<(typeof db)["myTable"]>>) {
// 		this.name = row.name ?? "";
// 		this.createdAt = row.createdAt ?? new Date();
// 		this.gender = row.gender ?? "Other";
// 	}

// 	serialize(): Partial<Database.Row<(typeof db)["myTable"]>> {
// 		return {
// 			name: this.name,
// 			createdAt: this.createdAt,
// 			gender: this.gender,
// 		};
// 	}
// }

// const TestTable = getDatabase<MainDatabase>().table("myTable").schema(Test);

// TestTable.on("insert", (row) => {
// 	console.log("insert schema", row);
// });

// TestTable.ready(async (table) => {
// 	const query = table.query().where("name", "LIKE", /^(m)/i);

// 	await table.insert([
// 		new Test({ name: "Maria", gender: "Female" }),
// 		new Test({ name: "João", gender: "Male" }),
// 		new Test({ name: "Pedro", gender: "Male" }),
// 		new Test({ name: "Martha", gender: "Female" }),
// 	]);

// 	console.log("query::", await query.get());
// });
