import BasicEventEmitter from "basic-event-emitter";
import { Row, Serialize } from "./Types";
import { Custom } from "./Custom";
import { Table } from "./Table";
import { Query } from "./Query";
export * from "./Types";
export * from "./Utils";
export * from "./Custom";
export * from "./Table";
/**
 * Define type for custom database constructor
 */
export type CustomConstructor<db = never> = new (database: string) => Custom<db>;
export type TableReady<S extends Serialize> = {
    table: Promise<Table<S> | undefined>;
    ready: <T = void>(callback: (table: Table<S>) => T | Promise<T>) => Promise<T>;
    query: () => Query<S, keyof S>;
    insert: (data: Partial<Row<S>>) => Promise<void>;
    on: (typeof Table<S>)["prototype"]["on"];
    once: (typeof Table<S>)["prototype"]["once"];
    off: (...args: Parameters<(typeof Table<S>)["prototype"]["off"]>) => void;
    offOnce: (...args: Parameters<(typeof Table<S>)["prototype"]["offOnce"]>) => TableReady<S>;
};
/**
 * Database class
 */
export declare class Database<db = never> extends BasicEventEmitter<{
    ready: (db: Database<db>) => void;
    deleteTable: (name: string) => void;
    disconnect: () => void;
    delete: () => void;
}> {
    readonly database: string;
    /**
     * The custom database class
     */
    readonly custom: Custom<db>;
    /**
     * The tables
     */
    private tables;
    /**
     * Create a database
     * @param custom The custom database class
     * @param database The database name
     * @example
     * const database = new Database(CustomDatabase, "my-database");
     */
    constructor(custom: CustomConstructor<db>, database: string);
    /**
     * The database is ready
     * @param callback The callback
     * @returns The promise
     * @example
     * await database.ready(() => {
     *    // Code here will run when the database is ready
     * });
     */
    ready<R = void>(callback?: (db: Database<db>) => Promise<R>): Promise<R>;
    /**
     * Disconnect from the database
     * @example
     * await database.disconnect();
     */
    disconnect(): Promise<void>;
    /**
     * Get a table
     * @param name The table name
     * @param columns The columns
     * @returns The table
     * @example
     * const table = await database.forTable("my-table", {
     *    id: { type: Database.Types.INTEGER, primaryKey: true },
     *    name: { type: Database.Types.TEXT, notNull: true },
     *    date: { type: Database.Types.DATETIME },
     * });
     */
    forTable<S extends Serialize>(name: string, columns: S): Promise<Table<S>>;
    /**
     * Get a ready table
     * @param table The table promise
     * @returns The table ready
     * @example
     * const table = database.readyTable("my-table", {
     *   id: { type: Database.Types.INTEGER, primaryKey: true },
     *   name: { type: Database.Types.TEXT, notNull: true },
     *   date: { type: Database.Types.DATETIME },
     * });
     *
     * await table.ready(async (table) => {
     *   // Code here will run when the table is ready
     * });
     *
     * @example
     * const table = database.forTable("my-table", {
     *   id: { type: Database.Types.INTEGER, primaryKey: true },
     *   name: { type: Database.Types.TEXT, notNull: true },
     *   date: { type: Database.Types.DATETIME },
     * });
     *
     * database.readyTable(table).ready(async (table) => {
     *   // Code here will run when the table is ready
     * });
     */
    readyTable<S extends Serialize>(table: Promise<Table<S>>): TableReady<S>;
    readyTable<S extends Serialize>(name: string, columns: S): TableReady<S>;
    /**
     * Get a table
     * @param name The table name
     * @param columns The columns
     * @returns The table
     * @example
     * const table = database.table("my-table", {
     *   id: { type: Database.Types.INTEGER, primaryKey: true },
     *   name: { type: Database.Types.TEXT, notNull: true },
     *   date: { type: Database.Types.DATETIME },
     * });
     *
     * table.ready(async (table) => {
     *   // Code here will run when the table is ready
     * });
     *
     * table.query().where("id", Database.Operators.EQUAL, 123).get("id", "name");
     */
    table<S extends Serialize>(name: string, columns: S): TableReady<S>;
    /**
     * Delete a table
     * @param name The table name
     * @returns A promise that resolves when the table is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteTable("my-table");
     */
    deleteTable(name: string): Promise<void>;
    /**
     * Delete the database
     * @returns A promise that resolves when the database is deleted
     * @throws If the database is disconnected
     * @example
     * await database.deleteDatabase();
     */
    deleteDatabase(): Promise<void>;
}
//# sourceMappingURL=Database.d.ts.map