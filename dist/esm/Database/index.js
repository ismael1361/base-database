import { appExists, getApp, getServer } from "../App";
import { App } from "../App/App";
import { Server } from "../App/Server";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { _database, _serialize, _tables } from "./internal";
import { ERROR_FACTORY } from "../Error";
import BasicEventEmitter from "basic-event-emitter";
export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";
export function getDatabase(app, dbname) {
    let database;
    if (typeof app === "string") {
        dbname = app;
        app = undefined;
    }
    if (typeof app === "object") {
        if (app instanceof App || app instanceof Server) {
            app = app;
            if (typeof dbname === "string") {
                dbname = dbname;
            }
            else if (typeof dbname === "object") {
                app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...dbname });
            }
        }
        else {
            app = appExists() ? getApp() : getServer();
            app.createDatabase({ name: DEFAULT_ENTRY_NAME, ...app });
        }
    }
    dbname = typeof dbname === "string" ? dbname : DEFAULT_ENTRY_NAME;
    app = app instanceof App || app instanceof Server ? app : appExists() ? getApp() : getServer();
    if (!_database.has(dbname)) {
        throw ERROR_FACTORY.create("getDatabase", "db-not-found" /* Errors.DB_NOT_FOUND */, { dbName: dbname });
    }
    database = _database.get(dbname);
    database.prepared = false;
    app?.ready(() => {
        database.prepared = true;
    });
    const events = new BasicEventEmitter();
    return {
        tablesNames: [...database.tablesNames],
        async ready(callback) {
            await super.ready();
            return await database.ready(() => callback?.(this) ?? Promise.resolve(undefined));
        },
        async disconnect() {
            await database.disconnect();
            database.prepared = false;
            _database.delete(dbname);
            _serialize.forEach((value, key) => {
                if (key.startsWith(`${dbname}_`)) {
                    _serialize.delete(key);
                }
            });
            _tables.forEach((value, key) => {
                if (key.startsWith(`${dbname}_`)) {
                    _tables.delete(key);
                }
            });
        },
        table(name) {
            let table;
            if (_tables.has(`${dbname}_${String(name)}`)) {
                table = _tables.get(`${dbname}_${String(name)}`);
            }
            else {
                const serialize = _serialize.get(`${dbname}_${String(name)}`);
                table = database.table(String(name), serialize);
                _tables.set(`${dbname}_${String(name)}`, table);
            }
            table.on("insert", (inserted) => {
                events.emit("insert", name, inserted);
            });
            table.on("update", (updated, previous) => {
                events.emit("update", name, updated, previous);
            });
            table.on("delete", (removed) => {
                events.emit("delete", name, removed);
            });
            return table;
        },
        async deleteTable(name) {
            await database.deleteTable(String(name));
            database.tablesNames = database.tablesNames.filter((value) => value !== String(name));
            _serialize.delete(`${dbname}_${String(name)}`);
            _tables.delete(`${dbname}_${String(name)}`);
        },
        on: events.on.bind(events),
        once: events.once.bind(events),
        off: events.off.bind(events),
        offOnce: events.offOnce.bind(events),
        async deleteDatabase() {
            await this.disconnect();
            await database.deleteDatabase();
        },
    };
}
//# sourceMappingURL=index.js.map