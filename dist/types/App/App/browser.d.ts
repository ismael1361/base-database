import BasicEventEmitter from "basic-event-emitter";
import * as Database from "../../Database/Database";
import type { DatabaseTables, DatabaseTyping } from "../../Database";
import { DEFAULT_ENTRY_NAME } from "../internal";
export interface AppSettings {
    name?: string;
}
type SimplifyTableTypes<T extends Database.TableType, S extends Database.Serialize<T> = Database.Serialize<T>> = {
    [K in keyof S]: Omit<S[K], "type"> & {
        type: S[K]["type"] extends string ? string : S[K]["type"];
    };
};
type SimplifyTablesTypes<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> = {
    [K in keyof T]: SimplifyTableTypes<T[K]>;
};
export interface DatabaseSettings<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>> {
    database: string;
    storage: Database.CustomConstructor<any>;
    tables: SimplifyTablesTypes<D, DB, T>;
}
export declare class App extends BasicEventEmitter<{
    createDatabase(name: string, options: DatabaseSettings<any, any>): void;
}> {
    readonly settings: AppSettings;
    readonly isServer: boolean;
    readonly name: string;
    isDeleted: boolean;
    constructor(settings: AppSettings, initialize?: boolean);
    initialize(): void;
    createDatabase<D extends DatabaseTyping, DB extends keyof D = typeof DEFAULT_ENTRY_NAME, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>>(options: DatabaseSettings<D, DB, T>): T;
    createDatabase<D extends DatabaseTyping, DB extends keyof D, T extends DatabaseTables<D, DB> = DatabaseTables<D, DB>>(name: DB, options: DatabaseSettings<D, DB, T>): T;
}
export {};
//# sourceMappingURL=browser.d.ts.map