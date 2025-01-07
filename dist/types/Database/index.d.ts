import { Tables, App, DatabaseSettings } from "../App/App";
import { Server } from "../App/Server";
import { Database } from "./";
import { Row, RowDeserialize } from "./Types";
import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";
export * as Database from "./Database";
export * as SQLiteRegex from "./SQLiteRegex";
type TableEvents<T extends Tables> = EventsListeners<{
    insert<N extends keyof T>(table: N, inserted: RowDeserialize<T[N], Row<T[N]>>): void;
    update<N extends keyof T>(table: N, updated: Array<RowDeserialize<T[N], Row<T[N]>>>, previous: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
    delete<N extends keyof T>(table: N, removed: Array<RowDeserialize<T[N], Row<T[N]>>>): void;
}>;
interface DataBase<T extends Tables> {
    ready<R = void>(callback?: (db: DataBase<T>) => Promise<R>): Promise<R>;
    disconnect(): Promise<void>;
    tablesNames: Array<keyof T>;
    table<N extends keyof T>(name: N): Database.TableReady<T[N]>;
    deleteTable(name: keyof T): Promise<void>;
    on: BasicEventEmitter<TableEvents<T>>["on"];
    once: BasicEventEmitter<TableEvents<T>>["once"];
    off: BasicEventEmitter<TableEvents<T>>["off"];
    offOnce: BasicEventEmitter<TableEvents<T>>["offOnce"];
    deleteDatabase(): Promise<void>;
}
export declare function getDatabase<T extends Tables>(): DataBase<T>;
export declare function getDatabase<T extends Tables>(dbname: string): DataBase<T>;
export declare function getDatabase<T extends Tables>(app: App | Server): DataBase<T>;
export declare function getDatabase<T extends Tables>(app: App | Server, dbname: string): DataBase<T>;
export declare function getDatabase<T extends Tables, D = never>(options: DatabaseSettings<T, D>): DataBase<T>;
export declare function getDatabase<T extends Tables, D = never>(app: App | Server, options: DatabaseSettings<T, D>): DataBase<T>;
//# sourceMappingURL=index.d.ts.map