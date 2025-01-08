"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Custom = void 0;
const Error_1 = require("../Error");
/**
 * Custom database class
 */
class Custom {
    /**
     * If the database is disconnected
     */
    _disconnected = false;
    /**
     * The database promise
     */
    database;
    /**
     * The database name
     */
    _databaseName;
    /**
     * Create a custom database
     * @param database The database name
     */
    constructor(database) {
        this._databaseName = database;
        this.database = this.connect(database);
    }
    /**
     * Get the database name
     */
    get databaseName() {
        return this._databaseName;
    }
    /**
     * If the database is disconnected
     */
    get disconnected() {
        return this._disconnected;
    }
    /**
     * Set if the database is disconnected
     */
    set disconnected(value) {
        this._disconnected = value;
        if (value)
            this.disconnect();
    }
    /**
     * The database is ready
     * @param callback The callback
     * @returns The promise
     * @throws If the database is disconnected
     * @example
     * await custom.ready(() => {
     *    // Code here will run when the database is ready
     * });
     */
    async ready(callback) {
        if (this._disconnected)
            throw Error_1.ERROR_FACTORY.create("Database.Custom", "db-disconnected" /* Errors.DB_DISCONNECTED */, { dbName: this.databaseName });
        const db = await this.database;
        return callback ? await callback(db) : undefined;
    }
}
exports.Custom = Custom;
//# sourceMappingURL=Custom.js.map