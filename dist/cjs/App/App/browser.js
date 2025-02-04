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
exports.App = void 0;
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
const Database = __importStar(require("../../Database/Database"));
const internal_1 = require("../internal");
const internal_2 = require("../../Database/internal");
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
        options = (typeof name === "string" ? options : name);
        name = (typeof name === "string" ? name : internal_1.DEFAULT_ENTRY_NAME);
        const { database, storage, tables } = options;
        const db = new Database.Database(storage, database);
        db.app = this;
        db.tablesNames = Object.keys(tables);
        internal_2._database.set(name, db);
        for (const [key, value] of Object.entries(tables)) {
            internal_2._serialize.set(`${name}_${key}`, value);
        }
        this.emit("createDatabase", name, options);
        return tables;
    }
}
exports.App = App;
//# sourceMappingURL=browser.js.map