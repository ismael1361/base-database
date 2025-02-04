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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteRegex = exports.Database = void 0;
exports.getDatabase = getDatabase;
const App_1 = require("../App");
const App_2 = require("../App/App");
const internal_1 = require("../App/internal");
const internal_2 = require("./internal");
const Error_1 = require("../Error");
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
exports.Database = __importStar(require("./Database"));
exports.SQLiteRegex = __importStar(require("./SQLiteRegex"));
function getDatabase(app, dbname) {
    let database;
    if (typeof app === "string") {
        dbname = app;
        app = undefined;
    }
    if (typeof app === "object") {
        if (app instanceof App_2.App) {
            app = app;
            if (typeof dbname === "string") {
                dbname = dbname;
            }
            else if (typeof dbname === "object") {
                app.createDatabase({ name: internal_1.DEFAULT_ENTRY_NAME, ...dbname });
            }
        }
        else {
            app = (0, App_1.appExists)() ? (0, App_1.getApp)() : undefined;
            app?.createDatabase({ name: internal_1.DEFAULT_ENTRY_NAME, ...app });
        }
    }
    dbname = (typeof dbname === "string" ? dbname : internal_1.DEFAULT_ENTRY_NAME);
    app = app instanceof App_2.App ? app : (0, App_1.appExists)() ? (0, App_1.getApp)() : undefined;
    if (!internal_2._database.has(dbname)) {
        throw Error_1.ERROR_FACTORY.create("getDatabase", "db-not-found" /* Errors.DB_NOT_FOUND */, { dbName: dbname });
    }
    database = internal_2._database.get(dbname);
    database.prepared = false;
    app = app instanceof App_2.App ? app : database.app;
    app?.ready(() => {
        database.prepared = true;
    });
    const events = new basic_event_emitter_1.default();
    return {
        tablesNames: [...database.tablesNames],
        async ready(callback) {
            return await database.ready(() => callback?.(this) ?? Promise.resolve(undefined));
        },
        async disconnect() {
            await database.disconnect();
            database.prepared = false;
            internal_2._database.delete(dbname);
            internal_2._serialize.forEach((value, key) => {
                if (key.startsWith(`${dbname}_`)) {
                    internal_2._serialize.delete(key);
                }
            });
            internal_2._tables.forEach((value, key) => {
                if (key.startsWith(`${dbname}_`)) {
                    internal_2._tables.delete(key);
                }
            });
        },
        table(name) {
            let table;
            if (internal_2._tables.has(`${dbname}_${String(name)}`)) {
                table = internal_2._tables.get(`${dbname}_${String(name)}`);
            }
            else {
                const serialize = internal_2._serialize.get(`${dbname}_${String(name)}`);
                table = database.table(String(name), serialize);
                internal_2._tables.set(`${dbname}_${String(name)}`, table);
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
            internal_2._serialize.delete(`${dbname}_${String(name)}`);
            internal_2._tables.delete(`${dbname}_${String(name)}`);
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