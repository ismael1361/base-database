import fs from "fs";
import path from "path";
import { Server } from "./index";
import { DEFAULT_ENTRY_NAME } from "../App";
import BasicEventEmitter from "basic-event-emitter";
import { Types } from "../Database/Utils";
import * as Storage from "../Storage";
import type { DatabaseSettings } from "./types";
import { auth_model, default_model } from "./models/databases";
import { parseJSONVariable } from "Utils";
import { Script } from "./script";
import Memo from "ipc-memo-cache";

export class Daemon extends BasicEventEmitter<{}> {
	app: Server = null!;
	script: Script = null!;

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

		this.script = new Script(this.app, this.rootDir);

		this.app.on("createDatabase", (name, options) => {
			console.log(name);
			this.script.createByDatabase(name);
		});

		await this.loadScript();

		await this.app.ready();

		await this.loadDatabase(true);

		this.prepared = true;
	}

	async loadDatabase(ready: boolean = false) {
		if (!ready) await this.ready();

		const configPath = path.resolve(this.rootDir, "databases", "db-config.json");

		if (!fs.existsSync(path.dirname(configPath))) {
			fs.mkdirSync(path.dirname(configPath), { recursive: true });
		}

		const variables = {
			ROOTDIR: path
				.resolve(this.rootDir, "databases")
				.replace(/\\/g, "/")
				.replace(/([\/]+)$/g, ""),
		};

		let config: DatabaseSettings = {
			[String(DEFAULT_ENTRY_NAME)]: parseJSONVariable(default_model, variables),
			__AUTH__: parseJSONVariable(auth_model, variables),
		};

		if (fs.existsSync(configPath)) {
			config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		} else {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
		}

		for (const dbName in config) {
			const findStorage = Object.keys(Storage).find((storage) => storage.toLowerCase() === config[dbName].storage.type);

			if (!findStorage) {
				continue;
			}

			this.app.createDatabase(dbName, {
				storage: new Storage[findStorage](config[dbName].storage.config),
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

	async loadScript() {
		await this.script.restart();
	}

	log(message: string, type: "info" | "warn" | "error" = "info") {
		this.ready(() => {
			fs.appendFileSync(path.resolve(this.rootDir, "stacks.log"), `time=${new Date().toISOString()} level=${type.toUpperCase()} message=${JSON.stringify(message)}\n`);
		});
	}
}
