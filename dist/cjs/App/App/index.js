"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const Browser = __importStar(require("./browser"));
const Utils_1 = require("../../Database/Utils");
const internal_1 = require("../internal");
class App extends Browser.App {
    constructor(settings, initialize = true) {
        super(settings, false);
        if (initialize)
            this.initialize();
    }
    initialize() {
        const tableTyping = {
            [internal_1.DEFAULT_ENTRY_NAME]: {},
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
                    const t = Array.isArray(options) ? options.map((s) => `"${s}"`).join(" | ") : types[(0, Utils_1.getDatatype)(type)];
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
exports.App = App;
//# sourceMappingURL=index.js.map