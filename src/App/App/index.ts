import * as Browser from "./browser";
import { getLocalPath } from "../../Utils";
import { getDatatype } from "../../Database/Utils";
import path from "path";
import fs from "fs";
import { DEFAULT_ENTRY_NAME } from "../internal";

export type { AppSettings, DatabaseSettings, Tables } from "./browser";

export class App extends Browser.App {
	constructor(settings: Browser.AppSettings, initialize: boolean = true) {
		super(settings, false);
		if (initialize) this.initialize();
	}

	initialize() {
		const tableTyping: Record<PropertyKey, any> = {
			[DEFAULT_ENTRY_NAME]: {},
		};

		this.on("createDatabase", (name, options) => {
			tableTyping[name] = {};

			const types = {
				TEXT: "string",
				BIGINT: "bigint",
				INTEGER: "number",
				FLOAT: "number",
				BOOLEAN: "boolean",
				DATETIME: "Date",
				NULL: "null",
			} as const;

			for (const table in options.tables) {
				tableTyping[name][table] = {};
				for (const [key, value] of Object.entries(options.tables[table])) {
					const { type, notNull, options } = value;
					const t = Array.isArray(options) ? options.map((s) => `"${s}"`).join(" | ") : types[getDatatype(type)];
					tableTyping[name][table][key] = notNull ? t : [t, "null", "undefined"].filter((s, i, l) => l.indexOf(s) === i).join(" | ");
				}
			}

			const globalTypingPath = path.join(getLocalPath(), "../../global.d.ts");

			const resultContent = `interface DatabaseTyping{
    ${Object.keys(tableTyping).map((table) => {
		return `"${table}": {
        ${Object.keys(tableTyping[table]).map((key) => {
			return `"${key}": {
            ${Object.entries(tableTyping[table][key])
				.map(([k, v]) => `"${k}": ${v}`)
				.join("; \n            ")};
        }`;
		})}
    }`;
	})}
}`;
			const currentContent = fs.readFileSync(globalTypingPath, { encoding: "utf-8" });

			if (currentContent != resultContent) {
				fs.writeFileSync(globalTypingPath, resultContent, { encoding: "utf-8" });
			}
		});

		super.initialize();
	}
}
