import { Table } from "Table";
import { Row, Serialize } from "./Types";
import { Query } from "Query";
import BasicEventEmitter, { BasicEventHandler } from "basic-event-emitter";
type Events<T extends BasicEventEmitter<any>> = T extends BasicEventEmitter<infer E> ? E : never;
type EventsListeners<T extends Events<any>> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => R : never;
};
type SubscriptionCallback<T extends Array<any> = any[]> = (...arg: T) => void;
export declare class TableReady<S extends Serialize, T extends EventsListeners<any> = EventsListeners<Events<Table<S>>>> {
    private readonly _table;
    constructor(table: Promise<Table<S>>);
    get table(): Promise<Table<S>>;
    ready<T = void>(callback: (table: Table<S>) => T | Promise<T>): Promise<T>;
    query(): Query<S>;
    insert(data: Partial<Row<S>>): Promise<void>;
    on<K extends keyof T>(event: K, callback: SubscriptionCallback<Parameters<T[K]>>): BasicEventHandler;
    once<K extends keyof T, R = any>(event: K, callback?: (...args: Parameters<T[K]>) => R): Promise<typeof callback extends undefined ? undefined : R>;
    off<K extends keyof T>(event: K, callback?: SubscriptionCallback<Parameters<T[K]>>): void;
    offOnce<K extends keyof T>(event: K, callback?: (...args: Parameters<T[K]>) => ReturnType<T[K]>): void;
}
export {};
//# sourceMappingURL=TableReady.d.ts.map