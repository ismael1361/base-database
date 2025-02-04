import BasicEventEmitter, { EventsListeners } from "basic-event-emitter";
import { DataType, Row, RowDeserialize, RowSerialize, SerializableClassType, Serialize, SerializeDataType, TableSchema, TableType, TypeSchemaOptions } from "./Types";
import { Custom } from "./Custom";
import { Query } from "./Query";
type TableEvents<T extends TableType, O = Row<T>> = EventsListeners<{
    insert: (inserted: RowDeserialize<T, O>) => void;
    update: (updated: Array<RowDeserialize<T, O>>, previous: Array<RowDeserialize<T, O>>) => void;
    delete: (removed: Array<RowDeserialize<T, O>>) => void;
}>;
/**
 * Table class
 */
export declare class Table<T extends TableType, O = Row<T>> extends BasicEventEmitter<TableEvents<T, O>> {
    readonly custom: Custom<any>;
    readonly name: string;
    /**
     * If the table is disconnected
     */
    private _disconnected;
    /**
     * The serialize datatype
     */
    private readonly serialize;
    /**
     * The initial promise
     */
    private readonly initialPromise;
    schema: TableSchema<T, O>;
    private _events;
    private _clearEvents;
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
    constructor(custom: Custom<any>, name: string, columns: Serialize<T>);
    private pipeEvent;
    /**
     * If the table is disconnected
     */
    disconnect(): Promise<void>;
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
    ready<R = never>(callback?: (table: Table<T, O>) => R | Promise<R>): Promise<R>;
    /**
     * Get the datatype of a column
     * @param key The column key
     * @returns The datatype
     * @example
     * table.getColumnType("id"); // "INTEGER"
     */
    getColumnType<C extends keyof T>(key: C): DataType<T[C]>;
    /**
     * Get the columns
     * @returns The columns
     * @example
     * table.getColumns();
     */
    getColumns(): SerializeDataType<T>;
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
    query(): Query<T, O>;
    /**
     * Bind a schema to the table
     * @param schema The schema
     * @param options The options
     * @param options.serializer The serializer
     * @param options.creator The creator
     * @returns The table
     * @example
     * class MyClass {
     *    ...
     *    serialize() { ... }
     *    static create() { ... }
     * }
     *
     * const schema = table.bindSchema(MyClass, { serializer: "serialize", creator: "create" });
     */
    bindSchema<O extends SerializableClassType<T>>(schema: O, options?: TypeSchemaOptions<T, O>): Table<T, O>;
    /**
     * Select all rows from the table
     * @param query The query
     * @returns The rows
     * @example
     * await table.selectAll(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    selectAll<K extends keyof T>(query?: Query<T, O, K>): Promise<Array<RowDeserialize<T, O, K>>>;
    /**
     * Select one row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectOne(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    selectOne<K extends keyof T>(query?: Query<T, O, K>): Promise<RowDeserialize<T, O, K> | null>;
    /**
     * Select the first row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectFirst(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    selectFirst<K extends keyof T>(query?: Query<T, O, K>): Promise<RowDeserialize<T, O, K> | null>;
    /**
     * Select the last row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectLast(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    selectLast<K extends keyof T>(query?: Query<T, O, K>): Promise<RowDeserialize<T, O, K> | null>;
    /**
     * Check if a row exists
     * @param query The query
     * @returns If the row exists
     * @example
     * await table.exists(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    exists(query: Query<T, O, any>): Promise<boolean>;
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
    insert<D extends RowSerialize<T, O> | Array<RowSerialize<T, O>>>(data: D): Promise<D extends Array<any> ? Array<RowDeserialize<T, O>> : RowDeserialize<T, O>>;
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
    update<D extends RowSerialize<T, O>>(data: D, query: Query<T, O, any>): Promise<Array<RowDeserialize<T, O>>>;
    /**
     * Delete rows from the table
     * @param query The query
     * @returns A promise
     * @example
     * await table.delete(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    delete(query: Query<T, O, any>): Promise<void>;
    /**
     * Get the length of the table
     * @param query The query
     * @returns The length
     * @example
     * await table.length(table.query.where("id", Database.Operators.EQUAL, 123 }));
     * await table.length();
     */
    length(query?: Query<T, O, any>): Promise<number>;
}
export {};
//# sourceMappingURL=Table.d.ts.map