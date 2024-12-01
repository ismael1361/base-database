import BasicEventEmitter from "basic-event-emitter";
import { Datatype, Row, Serialize, SerializeDatatype, Wheres } from "./Types";
import { getDatatype, serializeData } from "./Utils";
import { Custom } from "./Custom";

/**
 * Table class
 */
export class Table<S extends Serialize> extends BasicEventEmitter<{
	insert: (data: Row<S>) => void;
	update: (data: Partial<Row<S>>, where: Wheres<S>) => void;
	delete: (where: Wheres<S>) => void;
}> {
	/**
	 * If the table is disconnected
	 */
	private _disconnected: boolean = false;
	/**
	 * The serialize datatype
	 */
	private readonly serialize: SerializeDatatype<S>;
	/**
	 * The initial promise
	 */
	private readonly initialPromise: Promise<void>;

	/**
	 * Create a table
	 * @param custom The custom database class
	 * @param name The table name
	 * @param columns The columns
	 * @example
	 * const table = new Table(custom, "my-table", {
	 *    id: { type: Database.Types.INTEGER, primaryKey: true },
	 *    name: { type: Database.Types.TEXT, notNull: true },
	 *    date: { type: Database.Types.DATETIME },
	 * });
	 * table.selectAll();
	 * table.insert({ id: 123, name: "hello" });
	 * table.update({ name: "world" }, [{ column: "id", operator: "=", value: 123 }]);
	 * table.delete([{ column: "id", operator: "=", value: 123 }]);
	 */
	constructor(readonly custom: Custom<any>, private readonly name: string, columns: S) {
		super();
		this.serialize = Object.keys(columns).reduce((acc, key) => {
			acc[key] = {
				type: getDatatype(columns[key].type),
				primaryKey: columns[key].primaryKey ?? false,
				autoIncrement: columns[key].autoIncrement ?? false,
				notNull: columns[key].notNull ?? false,
				default: columns[key].default,
				unique: columns[key].unique ?? false,
				check: columns[key].check,
			};
			return acc;
		}, {} as any);

		this.initialPromise = this.custom.createTable(name, this.serialize);
	}

	/**
	 * If the table is disconnected
	 */
	async disconnect(): Promise<void> {
		this._disconnected = true;
	}

	/**
	 * The table is ready
	 * @param callback The callback
	 * @returns The promise
	 * @throws If the database is disconnected
	 * @example
	 * await table.ready((table) => {
	 *    // Code here will run when the table is ready
	 * });
	 */
	async ready<R = never>(callback?: (table: Table<S>) => R | Promise<R>): Promise<R> {
		if (this._disconnected) throw new Error("Database is disconnected");
		await this.initialPromise;
		return callback ? await callback(this) : (undefined as any);
	}

	/**
	 * Get the datatype of a column
	 * @param key The column key
	 * @returns The datatype
	 * @example
	 * table.getColumnType("id"); // "INTEGER"
	 */
	getColumnType<C extends keyof S>(key: C): Datatype<S[C]["type"]> {
		return this.serialize[key].type as any;
	}

	/**
	 * Get the columns
	 * @returns The columns
	 * @example
	 * table.getColumns();
	 */
	getColumns(): SerializeDatatype<S> {
		return this.serialize;
	}

	/**
	 * Prepare a where clause
	 * @param where The where clause
	 * @returns The where clause
	 * @example
	 * table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 });
	 */
	wheres<W extends keyof S>(...where: Wheres<S, W>): Wheres<S, W> {
		return where;
	}

	/**
	 * Select all rows from the table
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The rows
	 * @example
	 * await table.selectAll(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectAll<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Array<Row<S, K>>> {
		return this.ready(() => this.custom.selectAll<K>(this.name, columns, where as any));
	}

	/**
	 * Select one row from the table
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectOne(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectOne<K extends keyof S, W extends keyof S>(where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectOne<K>(this.name, columns, where as any));
	}

	/**
	 * Select the first row from the table
	 * @param by The column to select
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectFirst("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectFirst<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectFirst<K>(this.name, by, columns, where as any));
	}

	/**
	 * Select the last row from the table
	 * @param by The column to select
	 * @param where The where clause
	 * @param columns The columns to select
	 * @returns The row
	 * @example
	 * await table.selectLast("id", table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }), ["id", "name"]);
	 */
	selectLast<K extends keyof S, W extends keyof S>(by?: keyof S, where?: Wheres<S, W>, columns?: Array<K>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectLast<K>(this.name, by, columns, where as any));
	}

	/**
	 * Check if a row exists
	 * @param where The where clause
	 * @returns If the row exists
	 * @example
	 * await table.exists(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	exists<W extends keyof S>(where: Wheres<S, W>): Promise<boolean> {
		return this.ready(async () => {
			const data = await this.custom.selectOne(this.name, undefined, where as any);
			return data !== null;
		});
	}

	/**
	 * Insert a row into the table
	 * @param data The data to insert
	 * @returns A promise
	 * @throws If a column is missing
	 * @throws If a column is null and not nullable
	 * @throws If a column has an invalid datatype
	 * @example
	 * await table.insert({ id: 123, name: "hello" });
	 */
	async insert(data: Partial<Row<S>>): Promise<void> {
		data = await serializeData(this.serialize, data);
		return this.ready(() => this.custom.insert(this.name, data)).then(() => {
			this.emit("insert", data as any);
			return Promise.resolve();
		});
	}

	/**
	 * Update rows in the table
	 * @param data The data to update
	 * @param where The where clause
	 * @returns A promise
	 * @throws If a column is null and not nullable
	 * @throws If a column has an invalid datatype
	 * @example
	 * await table.update({ name: "world" }, table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	async update<W extends keyof S>(data: Partial<Row<S>>, where: Wheres<S, W>): Promise<void> {
		data = await serializeData(this.serialize, data, true);
		return this.ready(() => this.custom.update(this.name, data, where as any)).then(() => {
			this.emit("update", data as any, where as any);
			return Promise.resolve();
		});
	}

	/**
	 * Delete rows from the table
	 * @param where The where clause
	 * @returns A promise
	 * @example
	 * await table.delete(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 */
	delete<W extends keyof S>(where: Wheres<S, W>): Promise<void> {
		return this.ready(() => this.custom.delete(this.name, where as any)).then(() => {
			this.emit("delete", where as any);
			return Promise.resolve();
		});
	}

	/**
	 * Get the length of the table
	 * @param where The where clause
	 * @returns The length
	 * @example
	 * await table.length(table.wheres({ column: "id", operator: Database.Operators.EQUAL, value: 123 }));
	 * await table.length();
	 */
	length<W extends keyof S>(where?: Wheres<S, W>): Promise<number> {
		return this.ready(() => this.custom.length(this.name, where as any));
	}
}
