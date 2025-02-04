import { App, DatabaseSettings } from "../App/App";
import { DEFAULT_ENTRY_NAME } from "../App/internal";
import { Database } from "./";
import { Row, RowDeserialize, TableType } from "./Types";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";
export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";
export type DatabaseTyping = {
    [DB: PropertyKey]: {
        [T: PropertyKey]: TableType;
    };
};
type TableEvents<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> = EventsListeners<{
    insert<N extends keyof T>(table: N, inserted: RowDeserialize<T[N], Row<T[N]>>): void;
    update<N extends keyof T>(table: N, updated: Array<RowDeserialize<T[N], Row<T[N]>>>, previous: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
    delete<N extends keyof T>(table: N, removed: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
}>;
export type DatabaseTables<D extends DatabaseTyping, DB extends keyof D, T extends D[DB] = D[DB]> = T;
interface DataBase<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> {
    ready<R = void>(callback?: (db: DataBase<D, DB, T>) => Promise<R>): Promise<R>;
    disconnect(): Promise<void>;
    tablesNames: Array<keyof T>;
    table<N extends keyof T>(name: N): Database.TableReady<T[N]>;
    deleteTable(name: keyof T): Promise<void>;
    on: BasicEventEmitter<TableEvents<D, DB>>["on"];
    once: BasicEventEmitter<TableEvents<D, DB>>["once"];
    off: BasicEventEmitter<TableEvents<D, DB>>["off"];
    offOnce: BasicEventEmitter<TableEvents<D, DB>>["offOnce"];
    deleteDatabase(): Promise<void>;
}
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME>(): DataBase<T, DB>;
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T>(dbname: DB): DataBase<T, DB>;
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME>(app: App): DataBase<T, DB>;
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T>(app: App, dbname: DB): DataBase<T, DB>;
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME, D = never>(options: DatabaseSettings<T, DB>): DataBase<T, DB>;
export declare function getDatabase<T extends DatabaseTyping, DB extends keyof T = typeof DEFAULT_ENTRY_NAME, D = never>(app: App, options: DatabaseSettings<T, DB>): DataBase<T, DB>;
//# sourceMappingURL=index.d.ts.map