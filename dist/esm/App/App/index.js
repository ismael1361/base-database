import * as Browser from "./browser";
import { getDatatype } from "../../Database/Utils";
import { DEFAULT_ENTRY_NAME } from "../internal";
export class App extends Browser.App {
    constructor(settings, initialize = true) {
        super(settings, false);
        if (initialize)
            this.initialize();
    }
    initialize() {
        const tableTyping = {
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
            };
            for (const table in options.tables) {
                tableTyping[name][table] = {};
                for (const [key, value] of Object.entries(options.tables[table])) {
                    const { type, notNull, options } = value;
                    const t = Array.isArray(options) ? options.map((s) => `"${s}"`).join(" | ") : types[getDatatype(type)];
                    tableTyping[name][table][key] = notNull ? t : [t, "null", "undefined"].filter((s, i, l) => l.indexOf(s) === i).join(" | ");
                }
            }
            // 			const globalTypingPath = path.join(process.cwd(), "database.d.ts");
            // 			const resultContent = `interface DatabaseTyping{
            //     ${Object.keys(tableTyping).map((table) => {
            // 		return `"${table}": {
            //         ${Object.keys(tableTyping[table]).map((key) => {
            // 			return `"${key}": {
            //             ${Object.entries(tableTyping[table][key])
            // 				.map(([k, v]) => `"${k}": ${v}`)
            // 				.join("; \n            ")};
            //         }`;
            // 		})}
            //     }`;
            // 	})}
            // }`;
            // const currentContent = fs.existsSync(globalTypingPath) ? fs.readFileSync(globalTypingPath, { encoding: "utf-8" }) : "";
            // if (currentContent.trim().replace(/([\n\t\s]+)/gi, "") != resultContent.trim().replace(/([\n\t\s]+)/gi, "")) {
            // 	fs.writeFileSync(globalTypingPath, resultContent, { encoding: "utf-8" });
            // }
        });
        super.initialize();
    }
}
//# sourceMappingURL=index.js.map