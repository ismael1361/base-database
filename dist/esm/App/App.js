import BasicEventEmitter from "basic-event-emitter";
import * as Database from "../Database/Database";
import { DEFAULT_ENTRY_NAME } from "./internal";
import { _database, _serialize } from "../Database/internal";
export class App extends BasicEventEmitter {
    settings;
    isServer = false;
    name;
    isDeleted = false;
    constructor(settings, initialize = true) {
        super();
        this.settings = settings;
        this.name = settings.name ?? DEFAULT_ENTRY_NAME;
        if (initialize)
            this.initialize();
    }
    initialize() {
        this.prepared = true;
    }
    createDatabase(name, options) {
        options = typeof name === "string" ? options : name;
        name = typeof name === "string" ? name : DEFAULT_ENTRY_NAME;
        const { database, storage, tables } = options;
        const db = new Database.Database(storage, database);
        db.tablesNames = Object.keys(tables);
        _database.set(name, db);
        for (const [key, value] of Object.entries(tables)) {
            _serialize.set(`${name}_${key}`, value);
        }
        return tables;
    }
}
//# sourceMappingURL=App.js.map