"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
const Database_1 = require("../Database");
const internal_1 = require("./internal");
const internal_2 = require("../Database/internal");
class App extends basic_event_emitter_1.default {
    settings;
    isServer = false;
    name;
    isDeleted = false;
    constructor(settings, initialize = true) {
        super();
        this.settings = settings;
        this.name = settings.name ?? internal_1.DEFAULT_ENTRY_NAME;
        if (initialize)
            this.initialize();
    }
    initialize() {
        this.prepared = true;
    }
    createDatabase(name, options) {
        options = typeof name === "string" ? options : name;
        name = typeof name === "string" ? name : internal_1.DEFAULT_ENTRY_NAME;
        const { database, custom, tables } = options;
        const db = new Database_1.Database.Database(custom, database);
        db.tablesNames = Object.keys(tables);
        internal_2._database.set(name, db);
        for (const [key, value] of Object.entries(tables)) {
            internal_2._serialize.set(`${name}_${key}`, value);
        }
        return tables;
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map