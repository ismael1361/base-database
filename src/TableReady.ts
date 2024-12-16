import { Table } from "Table";
import { Row, Serialize } from "./Types";
import { Query } from "Query";
import BasicEventEmitter, { BasicEventHandler } from "basic-event-emitter";

type Events<T extends BasicEventEmitter<any>> = T extends BasicEventEmitter<infer E> ? E : never;

type EventsListeners<T extends Events<any>> = {
	[K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => R : never;
};

type SubscriptionCallback<T extends Array<any> = any[]> = (...arg: T) => void;

export class TableReady<S extends Serialize, T extends EventsListeners<any> = EventsListeners<Events<Table<S>>>> {
	private readonly _table: Promise<Table<S>>;

	constructor(table: Promise<Table<S>>) {
		this._table = table;
	}

	get table() {
		return this._table;
	}

	async ready<T = void>(callback: (table: Table<S>) => T | Promise<T>): Promise<T> {
		const t = await this.table;
		if (!t) throw new Error("Table not found");
		return t.ready(callback);
	}

	query(): Query<S> {
		if (!this.table) throw new Error("Table not found");
		return new Query<S>(this.table);
	}

	async insert(data: Partial<Row<S>>): Promise<void> {
		if (!this.table) throw new Error("Table not found");
		return await this.table.then((t) => t.insert(data));
	}

	on<K extends keyof T>(event: K, callback: SubscriptionCallback<Parameters<T[K]>>): BasicEventHandler {
		this.table.then((t) => t.on(event as any, callback as any));
		const self = this;

		return {
			remove() {
				self.table.then((t) => t.off(event as any, callback as any));
			},
			stop() {
				this.remove();
			},
		};
	}

	async once<K extends keyof T, R = any>(event: K, callback?: (...args: Parameters<T[K]>) => R): Promise<typeof callback extends undefined ? undefined : R> {
		return await this.table.then((t) => t.once(event as any, callback as any));
	}

	off<K extends keyof T>(event: K, callback?: SubscriptionCallback<Parameters<T[K]>>) {
		this.table.then((t) => t.off(event as any, callback as any));
	}

	offOnce<K extends keyof T>(event: K, callback?: (...args: Parameters<T[K]>) => ReturnType<T[K]>) {
		this.table.then((t) => t.offOnce(event as any, callback as any));
	}
}
