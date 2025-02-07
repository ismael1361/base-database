import sqlite3 from "sqlite3";
import type { Database } from "../Database";
import { Custom } from "../Database/Custom";
import * as SQLiteRegex from "../Database/SQLiteRegex";

const formatDateToSQL = (date: Date): string => {
	const pad = (n: number) => (n < 10 ? "0" + n : n);
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const normalizeWhereCompare = (compare: any) => {
	return typeof compare === "string" ? `'${compare}'` : compare instanceof Date ? formatDateToSQL(compare) : Array.isArray(compare) ? compare.map(normalizeWhereCompare) : compare;
};

const regexToSqlitePattern = (regex: RegExp) => {
	if (!(regex instanceof RegExp)) throw new Error("O argumento deve ser uma instância de RegExp.");
	let pattern = regex.source;
	const flags = regex.flags;
	if (flags.includes("i")) pattern = `(?i)${pattern}`;
	if (flags.includes("m")) pattern = `(?m)${pattern}`;
	if (flags.includes("s")) pattern = `(?s)${pattern}`;
	return normalizeWhereCompare(pattern);
};

const parseQuery = (query?: Database.QueryOptions) => {
	if (!query) return { columns: "*", where: "", order: "", limit: "", offset: "" };

	let whereClause: string[] = [];

	if (Array.isArray(query.wheres) && query.wheres.length > 0) {
		query.wheres.forEach(({ column, operator, compare }) => {
			compare = normalizeWhereCompare(compare);
			switch (operator) {
				case "=":
				case "!=":
				case "<":
				case "<=":
				case ">":
				case ">=":
					whereClause.push(`${column} ${operator} ${compare}`);
					break;
				case "IN":
				case "NOT IN":
					if (Array.isArray(compare) && compare.length > 0) whereClause.push(`${column} ${operator} (${compare.join(", ")})`);
					break;
				case "BETWEEN":
				case "NOT BETWEEN":
					if (Array.isArray(compare) && compare.length >= 2) whereClause.push(`${column} ${operator} ${compare[0]} AND ${compare[1]}`);
					break;
				case "LIKE":
				case "NOT LIKE":
					if (typeof compare === "string") whereClause.push(`${column} ${operator} ${compare}`);
					if (compare instanceof RegExp) whereClause.push(`${column} ${operator === "LIKE" ? "" : "NOT "}REGEXP ${regexToSqlitePattern(compare)}`);
					break;
			}
		});
	}

	Array.isArray(query.wheres) && query.wheres.length > 0 ? query.wheres.map((w) => `${w.column} ${w.operator} ${typeof w.compare === "string" ? `'${w.compare}'` : w.compare}`).join(" AND ") : "";

	const columnClause = Array.isArray(query.columns) && query.columns.length > 0 ? query.columns.filter((c) => c !== "rowid").join(", ") : "*";

	const orderClause = Array.isArray(query.order) && query.order.length > 0 ? query.order.map(({ column, ascending }) => `${String(column)} ${ascending ? "ASC" : "DESC"}`).join(", ") : "";

	return {
		columns: columnClause === "*" ? "rowid, *" : `rowid, ${columnClause}`,
		where: whereClause.join(" AND ").trim() === "" ? "" : `WHERE ${whereClause.join(" AND ").trim()}`,
		order: orderClause.trim() === "" ? "" : `ORDER BY ${orderClause.trim()}`,
		limit: query.take ? `LIMIT ${query.take}` : "",
		offset: query.skip ? `OFFSET ${query.skip}` : "",
	};
};

export class SQLite extends Custom<sqlite3.Database, Partial<{ local: string }>> {
	private db: sqlite3.Database | undefined;

	connect(database: string): Promise<sqlite3.Database> {
		return new Promise((resolve, reject) => {
			try {
				const db = (this.db = new sqlite3.Database(database));
				if (SQLiteRegex.implementable) db.loadExtension(SQLiteRegex.getLoadablePath());
				db.serialize(() => {
					resolve(db);
				});
			} catch (e) {
				const message = e instanceof Error ? e.message : String(e);
				return reject(new Error(message));
			}
		});
	}

	disconnect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.db) {
				this.db.close((err) => {
					if (err) reject(new Error(err.message));
					else resolve();
				});
			} else {
				reject(new Error("Database not connected"));
			}
		});
	}

	selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { columns, where, order, limit, offset } = parseQuery(query);

				db.all<Database.Row>(`SELECT ${columns} FROM ${table} ${where} ${order} ${limit} ${offset}`.trim() + ";", (err, rows) => {
					if (err) reject(new Error(err.message));
					else resolve(rows);
				});
			});
		});
	}

	selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { columns, where, order } = parseQuery(query);

				db.get<Database.Row | null | undefined>(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ";", (err, row) => {
					if (err) reject(new Error(err.message));
					else resolve(row ?? null);
				});
			});
		});
	}

	selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { columns, where, order } = parseQuery(query);

				db.get<Database.Row | null | undefined>(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ";", (err, row) => {
					if (err) reject(new Error(err.message));
					else resolve(row ?? null);
				});
			});
		});
	}

	selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { columns, where, order } = parseQuery(query);
				const offset = `LIMIT 1 OFFSET (SELECT COUNT(*) - 1 FROM ${table} ${where}`.trim() + ")";
				db.get<Database.Row | null | undefined>(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ` ${offset};`, (err, row) => {
					if (err) reject(new Error(err.message));
					else resolve(row ?? null);
				});
			});
		});
	}

	insert(table: string, data: Database.Row): Promise<Database.Row> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				delete (data as any).rowid;
				const columns = Object.keys(data).join(", ");
				const values = Object.keys(data)
					.map(() => `?`)
					.join(", ");

				const stmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${values});`);

				stmt.run(Object.values(data), function (err) {
					if (err) return reject(err);
					const lastRowID = this.lastID;
					db.get<Database.Row>(`SELECT rowid, * FROM ${table} WHERE rowid = ?`, [lastRowID], function (err, row) {
						if (err) return reject(err);
						resolve(row);
					});
				});

				stmt.finalize();
			});
		});
	}

	update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				delete (data as any).rowid;
				const setClause = Object.keys(data)
					.map((column) => `${column} = ?`)
					.join(", ");
				const { where } = parseQuery(query);

				if (where.trim() === "") {
					reject(new Error("WHERE clause is required for UPDATE operation"));
					return;
				}

				db.run(`UPDATE ${table} SET ${setClause} ${where}`.trim() + ";", Object.values(data), (err) => {
					if (err) reject(new Error(err.message));
					else resolve();
				});
			});
		});
	}

	delete(table: string, query: Database.QueryOptions): Promise<void> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { where } = parseQuery(query);

				if (where.trim() === "") {
					reject(new Error("WHERE clause is required for UPDATE operation"));
					return;
				}

				db.run(`DELETE FROM ${table} ${where}`.trim() + ";", (err) => {
					if (err) reject(new Error(err.message));
					else resolve();
				});
			});
		});
	}

	length(table: string, query?: Database.QueryOptions): Promise<number> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const { where } = parseQuery(query);

				db.get<{
					count: number;
				}>(`SELECT COUNT(*) AS count FROM ${table} ${where}`.trim() + ";", (err, row) => {
					if (err) reject(new Error(err.message));
					else resolve(row?.count ?? 0);
				});
			});
		});
	}

	createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				const columnClause = Object.fromEntries(
					Object.entries(columns).map(([column, info]) => {
						let clause = `${column} ${info.type}`;

						if (info.primaryKey) clause += " PRIMARY KEY";
						if (info.autoIncrement) clause += " AUTOINCREMENT";
						if (info.notNull) clause += " NOT NULL";
						if (info.default && typeof info.default !== "function") {
							switch (typeof info.default) {
								case "string":
									clause += ` DEFAULT ${JSON.stringify(info.default)}`;
									break;
								case "number":
								case "bigint":
								case "boolean":
									clause += ` DEFAULT ${info.default}`;
									break;
								case "object":
									if (info.default instanceof Date) {
										clause += ` DEFAULT ${info.default.getTime()}`;
									}
									break;
							}
						}
						if (info.unique) clause += " UNIQUE";

						return [column, clause];
					}),
				);

				db.all<{
					cid: number;
					name: string;
					type: string;
					notnull: number;
					dflt_value: string;
					pk: number;
				}>(`PRAGMA table_info(${table});`, (err, rows) => {
					if (err) {
						return reject(new Error(err.message));
					}

					const existingColumns = rows.map((row) => row.name); // Nomes das colunas existentes

					// Verifica e cria colunas ausentes
					const columnDefinitions: string[] = Object.keys(columns)
						.filter((column) => !existingColumns.includes(column)) // Apenas colunas ausentes
						.map((column) => {
							return `ALTER TABLE ${table} ADD COLUMN ${columnClause[column]}`;
						});

					// Executa as colunas ausentes
					const executeAddColumn = async () => {
						for (const query of columnDefinitions) {
							await new Promise<void>((resolveAdd, rejectAdd) => {
								db.run(query, (err) => {
									if (err) rejectAdd(new Error(err.message));
									else resolveAdd();
								});
							});
						}
					};

					db.run(`CREATE TABLE IF NOT EXISTS ${table} (${Object.values(columnClause).join(", ")});`, async (err) => {
						if (err) {
							return reject(new Error(err.message));
						}
						await executeAddColumn().catch(() => Promise.resolve());
						resolve();
					});
				});
			});
		});
	}

	deleteTable(table: string): Promise<void> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				db.run(`DROP TABLE IF EXISTS ${table};`, (err) => {
					if (err) reject(new Error(err.message));
					else resolve();
				});
			});
		});
	}

	deleteDatabase(): Promise<void> {
		return this.ready(async (db) => {
			return new Promise((resolve, reject) => {
				db.close((err) => {
					if (err) reject(new Error(err.message));
					else resolve();
				});
			});
		});
	}
}
