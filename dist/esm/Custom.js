/**
 * Custom database class
 */
export class Custom {
    /**
     * If the database is disconnected
     */
    _disconnected = false;
    /**
     * The database promise
     */
    database;
    /**
     * Create a custom database
     * @param database The database name
     */
    constructor(database) {
        this.database = this.connect(database);
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
            throw new Error("Database is disconnected");
        const db = await this.database;
        return callback ? await callback(db) : undefined;
    }
}
//# sourceMappingURL=Custom.js.map