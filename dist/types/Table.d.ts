import BasicEventEmitter from "basic-event-emitter";
import { DataType, Row, RowDeserialize, RowSerialize, SerializableClassType, Serialize, SerializeDataType, TypeSchemaOptions } from "./Types";
import { Custom } from "./Custom";
import { Query } from "./Query";
/**
 * Table class
 */
export declare class Table<S extends Serialize, O = Row<S>> extends BasicEventEmitter<{
    insert: (inserted: RowDeserialize<S, O>) => void;
    update: (updated: Array<RowDeserialize<S, O>>, previous: Array<RowDeserialize<S, O>>) => void;
    delete: (removed: Array<RowDeserialize<S, O>>) => void;
}> {
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
    private schema;
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
    constructor(custom: Custom<any>, name: string, columns: S);
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
    ready<R = never>(callback?: (table: Table<S, O>) => R | Promise<R>): Promise<R>;
    /**
     * Get the datatype of a column
     * @param key The column key
     * @returns The datatype
     * @example
     * table.getColumnType("id"); // "INTEGER"
     */
    getColumnType<C extends keyof S>(key: C): DataType<S[C]["type"]>;
    /**
     * Get the columns
     * @returns The columns
     * @example
     * table.getColumns();
     */
    getColumns(): SerializeDataType<S>;
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
    query(): Query<S, O>;
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
    bindSchema<O extends SerializableClassType<S>>(schema: O, options?: TypeSchemaOptions<S, O>): Table<S, O>;
    /**
     * Select all rows from the table
     * @param query The query
     * @returns The rows
     * @example
     * await table.selectAll(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    selectAll<K extends keyof S>(query?: Query<S, O, K>): Promise<Array<RowDeserialize<S, O, K>>>;
    /**
     * Select one row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectOne(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name"));
     */
    selectOne<K extends keyof S>(query?: Query<S, O, K>): Promise<RowDeserialize<S, O, K> | null>;
    /**
     * Select the first row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectFirst(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    selectFirst<K extends keyof S>(query?: Query<S, O, K>): Promise<RowDeserialize<S, O, K> | null>;
    /**
     * Select the last row from the table
     * @param query The query
     * @returns The row
     * @example
     * await table.selectLast(table.query.where("id", Database.Operators.EQUAL, 123 }).columns("id", "name").sort("id"));
     */
    selectLast<K extends keyof S>(query?: Query<S, O, K>): Promise<RowDeserialize<S, O, K> | null>;
    /**
     * Check if a row exists
     * @param query The query
     * @returns If the row exists
     * @example
     * await table.exists(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    exists(query: Query<S, O, any>): Promise<boolean>;
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
    insert(data: RowSerialize<S, O>): Promise<void>;
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
    update(data: RowSerialize<S, O>, query: Query<S, O, any>): Promise<void>;
    /**
     * Delete rows from the table
     * @param query The query
     * @returns A promise
     * @example
     * await table.delete(table.query.where("id", Database.Operators.EQUAL, 123 }));
     */
    delete(query: Query<S, O, any>): Promise<void>;
    /**
     * Get the length of the table
     * @param query The query
     * @returns The length
     * @example
     * await table.length(table.query.where("id", Database.Operators.EQUAL, 123 }));
     * await table.length();
     */
    length(query?: Query<S, O, any>): Promise<number>;
}
//# sourceMappingURL=Table.d.ts.map