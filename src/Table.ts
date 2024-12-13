import BasicEventEmitter from "basic-event-emitter";
import { Datatype, QueryOptions, Row, Serialize, SerializeDatatype } from "./Types";
import { getDatatype, serializeDataForGet, serializeDataForSet } from "./Utils";
import { Custom } from "./Custom";
import { Query } from "./Query";

/**
 * Table class
 */
export class Table<S extends Serialize> extends BasicEventEmitter<{
	insert: (inserted: Row<S>) => void;
	update: (updated: Array<Row<S>>, previous: Array<Row<S>>) => void;
	delete: (removed: Array<Row<S>>) => void;
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
	constructor(readonly custom: Custom<any>, readonly name: string, columns: S) {
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
	 * Create a query object
	 * @returns The query object
	 * @example
	 * table.query()
	 *  .where("id", Database.Operators.EQUAL, 123)
	 *  .sort("name")
	 *  .take(10)
	 *  .get("id", "name");
	 */
	query(): Query<S, keyof S> {
		return new Query(Promise.resolve(this));
	}

	/**
	 * Select all rows from the table
	 * @param query The query
	 * @returns The rows
	 * @example
	 * await table.selectAll(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
	 */
	async selectAll<K extends keyof S>(query?: Query<S, K>): Promise<Array<Row<S, K>>> {
		return await this.ready(async () => {
			const data = await this.custom.selectAll(this.name, query?.options);
			return await serializeDataForGet(this.serialize, data);
		});
	}

	/**
	 * Select one row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectOne(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
	 */
	async selectOne<K extends keyof S>(query?: Query<S, K>): Promise<Row<S, K> | null> {
		return await this.ready(async () => {
			const data = await this.custom.selectOne(this.name, query?.options);
			return data ? await serializeDataForGet(this.serialize, data) : null;
		});
	}

	/**
	 * Select the first row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectFirst(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
	 */
	async selectFirst<K extends keyof S>(query?: Query<S, K>): Promise<Row<S, K> | null> {
		return await this.ready(async () => {
			const data = await this.custom.selectFirst(this.name, query?.options);
			return data ? await serializeDataForGet(this.serialize, data) : null;
		});
	}

	/**
	 * Select the last row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectLast(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
	 */
	async selectLast<K extends keyof S>(query?: Query<S, K>): Promise<Row<S, K> | null> {
		return await this.ready(async () => {
			const data = await this.custom.selectLast(this.name, query?.options);
			return data ? await serializeDataForGet(this.serialize, data) : null;
		});
	}

	/**
	 * Check if a row exists
	 * @param query The query
	 * @returns If the row exists
	 * @example
	 * await table.exists(table.query.where("id", Database.Operators.EQUAL, 123 }));
	 */
	exists(query: Query<S, any>): Promise<boolean> {
		return this.ready(async () => {
			const data = await this.custom.selectOne(this.name, query.options);
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
		data = await serializeDataForSet(this.serialize, data);
		return this.ready(() => this.custom.insert(this.name, data)).then(() => {
			this.selectLast().then((row) => {
				this.emit("insert", row as any);
			});
			return Promise.resolve();
		});
	}

	/**
	 * Update rows in the table
	 * @param data The data to update
	 * @param query The query
	 * @returns A promise
	 * @throws If a column is null and not nullable
	 * @throws If a column has an invalid datatype
	 * @example
	 * await table.update({ name: "world" }, table.query.where("id", Database.Operators.EQUAL, 123 }));
	 */
	async update(data: Partial<Row<S>>, query: Query<S, any>): Promise<void> {
		data = await serializeDataForSet(this.serialize, data, true);
		const previous = await this.selectAll(query);
		return this.ready(() => this.custom.update(this.name, data, query.options)).then(() => {
			this.selectAll(query).then((updated) => {
				this.emit("update", updated as any, previous as any);
			});
			return Promise.resolve();
		});
	}

	/**
	 * Delete rows from the table
	 * @param query The query
	 * @returns A promise
	 * @example
	 * await table.delete(table.query.where("id", Database.Operators.EQUAL, 123 }));
	 */
	async delete(query: Query<S, any>): Promise<void> {
		const removed = await this.selectAll(query);
		return await this.ready(() => this.custom.delete(this.name, query.options)).then(() => {
			this.emit("delete", removed as any);
			return Promise.resolve();
		});
	}

	/**
	 * Get the length of the table
	 * @param query The query
	 * @returns The length
	 * @example
	 * await table.length(table.query.where("id", Database.Operators.EQUAL, 123 }));
	 * await table.length();
	 */
	length(query?: Query<S, any>): Promise<number> {
		return this.ready(() => this.custom.length(this.name, query?.options));
	}
}
