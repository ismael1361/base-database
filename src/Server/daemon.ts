import fs from "fs";
import path from "path";
import { Server } from "./index";
import { DEFAULT_ENTRY_NAME } from "../App";
import BasicEventEmitter from "basic-event-emitter";
import { Types } from "../Database/Utils";

interface DatabaseSettings {
	[db: string]: {
		tables: {
			[table: string]: {
				[column: string]: {
					type: "TEXT" | "INTEGER" | "FLOAT" | "BOOLEAN" | "DATETIME" | "BIGINT" | "NULL";
					primaryKey?: true | false;
					autoIncrement?: true | false;
					notNull?: true | false;
					default?: string | number | boolean | null;
					unique?: true | false;
					options?: string[];
				};
			};
		};
		storage: {
			type: "sqlite" | "mysql" | "postgres";
		};
	};
}

export class Daemon extends BasicEventEmitter<{}> {
	app: Server = null!;

	constructor(readonly host: string, readonly port: number, readonly rootDir: string) {
		super();
	}

	async initialize() {
		this.app = new Server({ name: DEFAULT_ENTRY_NAME });

		const server = this.app.createServer();

		await server.listen(this.port, this.host);

		if (!fs.existsSync(this.rootDir)) {
			fs.mkdirSync(this.rootDir, { recursive: true });
		}

		await this.app.ready();

		this.prepared = true;
	}

	async loadDatabase() {
		await this.ready();
		const configPath = path.resolve(this.rootDir, "db-config.json");
		let config: DatabaseSettings = {
			[DEFAULT_ENTRY_NAME]: {
				tables: {
					users: {
						id: {
							type: "INTEGER",
							primaryKey: true,
							autoIncrement: true,
						},
						username: {
							type: "TEXT",
							notNull: true,
							unique: true,
						},
						password: {
							type: "TEXT",
							notNull: true,
						},
						email: {
							type: "TEXT",
							notNull: true,
							unique: true,
						},
						createdAt: {
							type: "DATETIME",
							notNull: true,
							default: "CURRENT_TIMESTAMP",
						},
					},
				},
				storage: {
					type: "sqlite",
				},
			},
		};

		if (fs.existsSync(configPath)) {
			config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		} else {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
		}

		for (const dbName in config) {
			this.app.createDatabase<any, any>(dbName, {
				database: ":memory:",
				storage: null!,
				tables: Object.fromEntries(
					Object.entries(config[dbName].tables).map(([tableName, table]) => {
						return [
							tableName,
							Object.fromEntries(
								Object.entries(table).map(([columnName, column]) => {
									return [
										columnName,
										{
											type: Types[column.type],
											primaryKey: column.primaryKey ?? false,
											autoIncrement: column.autoIncrement && column.primaryKey,
											notNull: column.notNull ?? false,
											default: column.type === "DATETIME" && typeof column.default === "string" ? new Date(column.default) : column.default ?? null,
											unique: column.unique ?? false,
											options: column.type === "TEXT" ? column.options ?? [] : [],
										},
									];
								}),
							),
						];
					}),
				),
			});
		}
	}

	log(message: string, type: "info" | "warn" | "error" = "info") {
		this.ready(() => {
			fs.appendFileSync(path.resolve(this.rootDir, "stacks.log"), `time=${new Date().toISOString()} level=${type.toUpperCase()} message=${JSON.stringify(message)}\n`);
		});
	}
}
