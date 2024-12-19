"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableReady = void 0;
const Query_1 = require("Query");
class TableReady {
    _table;
    constructor(table) {
        this._table = table;
    }
    get table() {
        return this._table;
    }
    async ready(callback) {
        const t = await this.table;
        if (!t)
            throw new Error("Table not found");
        return t.ready(callback);
    }
    query() {
        if (!this.table)
            throw new Error("Table not found");
        return new Query_1.Query(this.table);
    }
    async insert(data) {
        if (!this.table)
            throw new Error("Table not found");
        return await this.table.then((t) => t.insert(data));
    }
    on(event, callback) {
        this.table.then((t) => t.on(event, callback));
        const self = this;
        return {
            remove() {
                self.table.then((t) => t.off(event, callback));
            },
            stop() {
                this.remove();
            },
        };
    }
    async once(event, callback) {
        return await this.table.then((t) => t.once(event, callback));
    }
    off(event, callback) {
        this.table.then((t) => t.off(event, callback));
    }
    offOnce(event, callback) {
        this.table.then((t) => t.offOnce(event, callback));
    }
}
exports.TableReady = TableReady;
//# sourceMappingURL=TableReady.js.map