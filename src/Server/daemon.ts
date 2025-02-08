import fs from "fs";
import path from "path";
import { Server } from "./index";
import { DEFAULT_ENTRY_NAME } from "../App";
import BasicEventEmitter from "basic-event-emitter";
import { Types } from "../Database/Utils";
import * as CustomStorage from "../CustomStorage";
import type { DatabaseSettings } from "./types";
import { auth_model, default_model } from "./models";
import { parseJSONVariable } from "Utils";

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

		await this.loadDatabase(true);

		this.prepared = true;
	}

	async loadDatabase(ready: boolean = false) {
		if (!ready) await this.ready();

		const configPath = path.resolve(this.rootDir, "db-config.json");
		const variables = { ROOTDIR: this.rootDir.replace(/([\\\/]+)$/g, "") };

		let config: DatabaseSettings = {
			[DEFAULT_ENTRY_NAME]: parseJSONVariable(default_model, variables),
			__AUTH__: parseJSONVariable(auth_model, variables),
		};

		if (fs.existsSync(configPath)) {
			config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		} else {
			fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
		}

		for (const dbName in config) {
			const findStorage = Object.keys(CustomStorage).find((storage) => storage.toLowerCase() === config[dbName].storage.type);

			if (!findStorage) {
				continue;
			}

			this.app.createDatabase<any, any>(dbName, {
				storage: { custom: CustomStorage[findStorage], config: config[dbName].storage.config },
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
