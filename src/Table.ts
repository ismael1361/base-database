import BasicEventEmitter from "basic-event-emitter";
import { Datatype, QueryOptions, Row, Serialize, SerializeDatatype } from "./Types";
import { getDatatype, serializeData } from "./Utils";
import { Custom } from "./Custom";
import { Query } from "./Query";

/**
 * Table class
 */
export class Table<S extends Serialize> extends BasicEventEmitter<{
	insert: (data: Row<S>) => void;
	update: (data: Partial<Row<S>>, query: QueryOptions<S>) => void;
	delete: (query: QueryOptions<S>) => void;
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
	query(): Query<S> {
		return new Query(this);
	}

	/**
	 * Select all rows from the table
	 * @param query The query
	 * @returns The rows
	 * @example
	 * await table.selectAll(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
	 */
	selectAll<K extends keyof S>(query?: Query<S>): Promise<Array<Row<S, K>>> {
		return this.ready(() => this.custom.selectAll(this.name, query?.options));
	}

	/**
	 * Select one row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectOne(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
	 */
	selectOne<K extends keyof S>(query?: Query<S>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectOne(this.name, query?.options));
	}

	/**
	 * Select the first row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectFirst(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
	 */
	selectFirst<K extends keyof S>(query?: Query<S>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectFirst(this.name, query?.options));
	}

	/**
	 * Select the last row from the table
	 * @param query The query
	 * @returns The row
	 * @example
	 * await table.selectLast(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
	 */
	selectLast<K extends keyof S>(query?: Query<S>): Promise<Row<S, K> | null> {
		return this.ready(() => this.custom.selectLast(this.name, query?.options));
	}

	/**
	 * Check if a row exists
	 * @param query The query
	 * @returns If the row exists
	 * @example
	 * await table.exists(table.query.where("id", Database.Operators.EQUAL, 123 }));
	 */
	exists(query: Query<S>): Promise<boolean> {
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
		data = await serializeData(this.serialize, data);
		return this.ready(() => this.custom.insert(this.name, data)).then(() => {
			this.emit("insert", data as any);
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
	async update(data: Partial<Row<S>>, query: Query<S>): Promise<void> {
		data = await serializeData(this.serialize, data, true);
		return this.ready(() => this.custom.update(this.name, data, query.options)).then(() => {
			this.emit("update", data as any, query.options);
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
	async delete(query: Query<S>): Promise<void> {
		return await this.ready(() => this.custom.delete(this.name, query.options)).then(() => {
			this.emit("delete", query.options);
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
	length(query?: Query<S>): Promise<number> {
		return this.ready(() => this.custom.length(this.name, query?.options));
	}
}
