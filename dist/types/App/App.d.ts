import BasicEventEmitter from "basic-event-emitter";
import { Database } from "../Database";
export interface AppSettings {
    name?: string;
}
export type Tables<T extends Record<PropertyKey, Database.Serialize> = Record<PropertyKey, Database.Serialize>> = {
    [K in keyof T]: T[K];
};
export interface DatabaseSettings<T extends Tables, D = never> {
    database: string;
    custom: Database.CustomConstructor<D>;
    tables: T;
}
export declare class App extends BasicEventEmitter<{}> {
    readonly settings: AppSettings;
    readonly isServer: boolean;
    readonly name: string;
    isDeleted: boolean;
    constructor(settings: AppSettings, initialize?: boolean);
    initialize(): void;
    createDatabase<T extends Tables, D = never>(options: DatabaseSettings<T, D>): T;
    createDatabase<T extends Tables, D = never>(name: string, options: DatabaseSettings<T, D>): T;
}
//# sourceMappingURL=App.d.ts.map