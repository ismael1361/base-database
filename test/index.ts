import { Database, initializeApp, getDatabase } from "../src";
import { ModelDatabase } from "./DB";
import { SQLite } from "./SQLite";

const app = initializeApp();
const db = app.createDatabase({
	database: ":memory:",
	custom: SQLite,
	tables: {
		test: Database.columns({
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

class Test {
	public name: string;
	public createdAt: Date;
	public gender: "Female" | "Male" | "Other";

	constructor(row: Partial<Database.Row<typeof db.test>>) {
		this.name = row.name ?? "";
		this.createdAt = row.createdAt ?? new Date();
		this.gender = row.gender ?? "Other";
	}

	serialize(): Partial<Database.Row<typeof db.test>> {
		return {
			name: this.name,
			createdAt: this.createdAt,
			gender: this.gender,
		};
	}
}

const test = getDatabase<typeof db>().table("test");

const TestTable = test.schema(Test);

TestTable.on("insert", (row) => {
	console.log("insert schema", row);
});

TestTable.ready(async (table) => {
	const query = table.query().where("name", "LIKE", /^(m)/i);

	await table.insert([
		new Test({ name: "Maria", gender: "Female" }),
		new Test({ name: "João", gender: "Male" }),
		new Test({ name: "Pedro", gender: "Male" }),
		new Test({ name: "Martha", gender: "Female" }),
	]);

	console.log("query::", await query.get());
});
