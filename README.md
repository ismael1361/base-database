# Base-Database

**Base-Database** é uma biblioteca projetada para oferecer uma padronização eficiente no gerenciamento de dados, permitindo integração com diversos tipos de armazenamento. Através de sua estrutura modular, o desenvolvedor pode criar soluções personalizadas ao estender a classe abstrata `Database.Custom`, que serve como base para diferentes estratégias de armazenamento.

- [Base-Database](#base-database)
  - [Funcionalidades](#funcionalidades)
  - [Como funciona](#como-funciona)
  - [Exemplos de Uso](#exemplos-de-uso)
  - [Instalação](#instalação)
  - [Exemplo de Implementação](#exemplo-de-implementação)
  - [``Database.Custom<db = never>``](#databasecustomdb--never)
    - [``constructor(database: string)``](#constructordatabase-string)
    - [``connect(database: string): Promise<db>``](#connectdatabase-string-promisedb)
    - [``disconnect(): Promise<void>``](#disconnect-promisevoid)
    - [``selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>>``](#selectalltable-string-query-databasequeryoptions-promisearraydatabaserow)
    - [``selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``](#selectonetable-string-query-databasequeryoptions-promisedatabaserow--null)
    - [``selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``](#selectfirsttable-string-query-databasequeryoptions-promisedatabaserow--null)
    - [``selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``](#selectlasttable-string-query-databasequeryoptions-promisedatabaserow--null)
    - [``insert(table: string, data: Database.Row): Promise<Database.Row>``](#inserttable-string-data-databaserow-promisedatabaserow)
    - [``update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void>``](#updatetable-string-data-partialdatabaserow-query-databasequeryoptions-promisevoid)
    - [``delete(table: string, query: Database.QueryOptions): Promise<void>``](#deletetable-string-query-databasequeryoptions-promisevoid)
    - [``length(table: string, query?: Database.QueryOptions): Promise<number>``](#lengthtable-string-query-databasequeryoptions-promisenumber)
    - [``createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void>``](#createtabletable-string-columns-databaseserializedatatypeany-promisevoid)
    - [``deleteTable(table: string): Promise<void>``](#deletetabletable-string-promisevoid)
    - [``deleteDatabase(): Promise<void>``](#deletedatabase-promisevoid)
    - [Exemplo utilizando SQLite](#exemplo-utilizando-sqlite)
  - [``Database.Database``](#databasedatabase)
    - [``Database.Database.ready``](#databasedatabaseready)
    - [``Database.Database.disconnect``](#databasedatabasedisconnect)
    - [``Database.Database.forTable``](#databasedatabasefortable)
      - [``Database.Serialize``](#databaseserialize)
    - [``Database.Database.readyTable``](#databasedatabasereadytable)
      - [``Database.Database.readyTable.ready``](#databasedatabasereadytableready)
      - [``Database.Database.readyTable.query``](#databasedatabasereadytablequery)
      - [``Database.Database.readyTable.insert``](#databasedatabasereadytableinsert)
      - [``Database.Database.readyTable.selectAll``](#databasedatabasereadytableselectall)
      - [``Database.Database.readyTable.selectOne``](#databasedatabasereadytableselectone)
      - [``Database.Database.readyTable.selectFirst``](#databasedatabasereadytableselectfirst)
      - [``Database.Database.readyTable.selectLast``](#databasedatabasereadytableselectlast)
      - [``Database.Database.readyTable.length``](#databasedatabasereadytablelength)
      - [``Database.Database.readyTable.on``, ``Database.Database.readyTable.once``, ``Database.Database.readyTable.off`` e ``Database.Database.readyTable.offOnce``](#databasedatabasereadytableon-databasedatabasereadytableonce-databasedatabasereadytableoff-e-databasedatabasereadytableoffonce)
      - [``Database.Database.readyTable.schema``](#databasedatabasereadytableschema)
    - [``Database.Database.table``](#databasedatabasetable)
    - [``Database.Database.deleteTable``](#databasedatabasedeletetable)
    - [``Database.Database.deleteDatabase``](#databasedatabasedeletedatabase)
  - [``Database.Table``](#databasetable)
    - [``Database.Table.disconnect``](#databasetabledisconnect)
    - [``Database.Table.ready``](#databasetableready)
    - [``Database.Table.getColumnType``](#databasetablegetcolumntype)
    - [``Database.Table.getColumns``](#databasetablegetcolumns)
    - [``Database.Table.query``](#databasetablequery)
      - [``Database.Table.query.where``](#databasetablequerywhere)
      - [``Database.Table.query.filter``](#databasetablequeryfilter)
      - [``Database.Table.query.take``](#databasetablequerytake)
      - [``Database.Table.query.skip``](#databasetablequeryskip)
      - [``Database.Table.query.sort``](#databasetablequerysort)
      - [``Database.Table.query.order``](#databasetablequeryorder)
      - [``Database.Table.query.columns``](#databasetablequerycolumns)
      - [``Database.Table.query.get``](#databasetablequeryget)
      - [``Database.Table.query.first``](#databasetablequeryfirst)
      - [``Database.Table.query.last``](#databasetablequerylast)
      - [``Database.Table.query.one``](#databasetablequeryone)
      - [``Database.Table.query.exists``](#databasetablequeryexists)
      - [``Database.Table.query.count``](#databasetablequerycount)
      - [``Database.Table.query.length``](#databasetablequerylength)
      - [``Database.Table.query.set``](#databasetablequeryset)
      - [``Database.Table.query.update``](#databasetablequeryupdate)
      - [``Database.Table.query.delete``](#databasetablequerydelete)
    - [``Database.Table.bindSchema``](#databasetablebindschema)
    - [``Database.Table.selectAll``](#databasetableselectall)
    - [``Database.Table.selectOne``](#databasetableselectone)
    - [``Database.Table.selectFirst``](#databasetableselectfirst)
    - [``Database.Table.selectLast``](#databasetableselectlast)
    - [``Database.Table.exists``](#databasetableexists)
    - [``Database.Table.insert``](#databasetableinsert)
    - [``Database.Table.update``](#databasetableupdate)
    - [``Database.Table.delete``](#databasetabledelete)
    - [``Database.Table.length``](#databasetablelength)
    - [``Database.Table.on``, ``Database.Table.once``, ``Database.Table.off`` e ``Database.Table.offOnce``](#databasetableon-databasetableonce-databasetableoff-e-databasetableoffonce)
  - [``Database.Operators``](#databaseoperators)
  - [``Database.Types``](#databasetypes)

## Funcionalidades

- **Flexibilidade:** Suporte para diversas formas de armazenamento, incluindo SQLite, LocalStorage, MongoDB, entre outros.
- **Personalização:** Permite criar classes específicas que personalizam o comportamento do armazenamento e da gestão de dados.
- **Intermediação:** A classe `Database.Database` atua como um intermediário universal, gerenciando a interação entre os dados e o tipo de armazenamento definido na implementação.

## Como funciona

1. **Criação de uma classe personalizada:** O desenvolvedor estende a classe abstrata `Database.Custom` para criar sua própria solução de armazenamento e gerenciamento.
2. **Integração com `Database.Database`:** A classe `Database.Database` utiliza a implementação personalizada para operar de forma padronizada, facilitando a manipulação e consulta de dados.

Essa abordagem permite uma adaptação eficiente para diferentes contextos, mantendo uma arquitetura escalável e modular.

## Exemplos de Uso

- Gerenciamento de dados local com `LocalStorage`.
- Armazenamento em bancos de dados relacionais como `SQLite`.
- Suporte a bancos NoSQL como `MongoDB`.

**Base-Database** é ideal para desenvolvedores que buscam uma solução robusta e flexível para unificar a gestão de dados em diferentes plataformas.

## Instalação

Para instalar a biblioteca para node.js, utilize o comando:

```bash
npm install base-database
```

## Exemplo de Implementação

A seguir, um exemplo de implementação de uma classe personalizada que estende `Database.Custom`:

```ts
import * as Database from 'base-database';

class MyDatabase extends Database.Custom {
  // Implementação dos métodos abstratos
}
```

Para utilizar a classe personalizada, basta instanciar `Database.Database` com a implementação desejada:

```ts
const db = new Database.Database(MyDatabase, "my-database");
```

A partir desse ponto, é possível utilizar os métodos de `Database.Database` para interagir com os dados de forma padronizada.

## ``Database.Custom<db = never>``

A classe abstrata `Database.Custom` define os métodos necessários para a implementação de uma solução personalizada de armazenamento. A seguir, a lista de métodos que devem ser implementados:

```ts
import * as Database from 'base-database';
import * as sqlite3 from 'sqlite3';

class MyDatabase extends Database.Custom<sqlite3.Database> {
    // Implementação dos métodos abstratos
}
```

### ``constructor(database: string)``

Construtor da classe personalizada. Deve receber o nome do banco de dados como parâmetro.

```ts
constructor(database: string) {
  // Implementação do construtor
}
```

### ``connect(database: string): Promise<db>``

Método responsável por conectar ao armazenamento de dados. Deve retornar uma `Promise` que resolve com o objeto de conexão.

```ts
import * as sqlite3 from 'sqlite3';

// Código anterior....

connect(database: string): Promise<sqlite3.Database> {
  // Implementação da conexão
}
```

### ``disconnect(): Promise<void>``

Método responsável por desconectar do armazenamento de dados. Deve retornar uma `Promise` que resolve após a desconexão.

```ts
disconnect(): Promise<void> {
  // Implementação da desconexão
}
```

### ``selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>>``

Método responsável por selecionar todos os registros de uma tabela. Deve retornar uma `Promise` que resolve com um array de registros.

```ts
selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
  // Implementação da seleção
}
```

### ``selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar um registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

### ``selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar o primeiro registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

### ``selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar o último registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

### ``insert(table: string, data: Database.Row): Promise<Database.Row>``

Método responsável por inserir um registro em uma tabela. Deve retornar uma `Promise` que resolve após a inserção.

```ts
insert(table: string, data: Database.Row): Promise<Database.Row> {
  // Implementação da inserção
}
```

### ``update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void>``

Método responsável por atualizar registros em uma tabela. Deve retornar uma `Promise` que resolve após a atualização.

```ts
update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void> {
  // Implementação da atualização
}
```

### ``delete(table: string, query: Database.QueryOptions): Promise<void>``

Método responsável por deletar registros de uma tabela. Deve retornar uma `Promise` que resolve após a deleção.

```ts
delete(table: string, query: Database.QueryOptions): Promise<void> {
  // Implementação da deleção
}
```

### ``length(table: string, query?: Database.QueryOptions): Promise<number>``

Método responsável por obter o número de registros de uma tabela. Deve retornar uma `Promise` que resolve com o número de registros.

```ts
length(table: string, query?: Database.QueryOptions): Promise<number> {
  // Implementação do cálculo do número de registros
}
```

### ``createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void>``

Método responsável por criar uma tabela. Deve retornar uma `Promise` que resolve após a criação da tabela.

```ts
createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void> {
  // Implementação da criação da tabela
}
```

### ``deleteTable(table: string): Promise<void>``

Método responsável por deletar uma tabela. Deve retornar uma `Promise` que resolve após a deleção da tabela.

```ts
deleteTable(table: string): Promise<void> {
  // Implementação da deleção da tabela
}
```

### ``deleteDatabase(): Promise<void>``

Método responsável por deletar o banco de dados. Deve retornar uma `Promise` que resolve após a deleção do banco de dados.

```ts
deleteDatabase(): Promise<void> {
  // Implementação da deleção do banco de dados
}
```

### Exemplo utilizando SQLite

Para utilizar SQLite como armazenamento, é necessário instalar o pacote `sqlite3`:

```bash
npm install sqlite3
```

Em seguida, implemente a classe personalizada para SQLite:

```ts
import * as Database from 'base-database';
import * as sqlite3 from 'sqlite3';

const formatDateToSQL = (date: Date): string => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const normalizeWhereCompare = (compare: any) => {
    return typeof compare === "string" ? `'${compare}'` : compare instanceof Date ? formatDateToSQL(compare) : Array.isArray(compare) ? compare.map(normalizeWhereCompare) : compare;
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
                    if (Array.isArray(compare) && compare.length > 0) whereClause.push(`${column} IN (${compare.join(", ")})`);
                    break;
                case "NOT IN":
                    if (Array.isArray(compare) && compare.length > 0) whereClause.push(`${column} NOT IN (${compare.join(", ")})`);
                    break;
                case "BETWEEN":
                    if (Array.isArray(compare) && compare.length >= 2) whereClause.push(`${column} BETWEEN ${compare[0]} AND ${compare[1]}`);
                    break;
                case "NOT BETWEEN":
                    if (Array.isArray(compare) && compare.length >= 2) whereClause.push(`${column} NOT BETWEEN ${compare[0]} AND ${compare[1]}`);
                    break;
                case "LIKE":
                    if (typeof compare === "string") whereClause.push(`${column} LIKE ${compare}`);
                    break;
                case "NOT LIKE":
                    if (typeof compare === "string") whereClause.push(`${column} NOT LIKE ${compare}`);
                    break;
            }
        });
    }

    Array.isArray(query.wheres) && query.wheres.length > 0 ? query.wheres.map((w) => `${w.column} ${w.operator} ${typeof w.compare === "string" ? `'${w.compare}'` : w.compare}`).join(" AND ") : "";

    const columnClause = Array.isArray(query.wheres) && query.columns.length > 0 ? query.columns.join(", ") : "*";

    const orderClause = Array.isArray(query.order) && query.order.length > 0 ? query.order.map(({ column, ascending }) => `${String(column)} ${ascending ? "ASC" : "DESC"}`).join(", ") : "";

    return {
        columns: columnClause,
        where: whereClause.join(" AND ").trim() === "" ? "" : `WHERE ${whereClause.join(" AND ").trim()}`,
        order: orderClause.trim() === "" ? "" : `ORDER BY ${orderClause.trim()}`,
        limit: query.take ? `LIMIT ${query.take}` : "",
        offset: query.skip ? `OFFSET ${query.skip}` : "",
    };
};

class SQLite extends Database.Custom<sqlite3.Database> {
	private db: sqlite3.Database | undefined;

    connect(database: string): Promise<sqlite3.Database> {
        return new Promise((resolve, reject) => {
            try {
                this.db = new sqlite3.Database(database);
            } catch (e) {
                const message = e instanceof Error ? e.message : String(e);
                return reject(new HandleError(message, "SQLITE_ERROR", e));
            }
            resolve(this.db);
        });
    }

    disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
                    else resolve();
                });
            } else {
                reject(new HandleError("Database not connected", "SQLITE_ERROR"));
            }
        });
    }

    selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { columns, where, order, limit, offset } = parseQuery(query);

                db.all<Database.Row>(`SELECT ${columns} FROM ${table} ${where} ${order} ${limit} ${offset}`.trim() + ";", (err, rows) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
                    else resolve(row ?? null);
                });
            });
        });
    }

    insert(table: string, data: Database.Row): Promise<Database.Row> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const columns = Object.keys(data).join(", ");
                const values = Object.values(data)
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
                const setClause = Object.keys(data)
                    .map((column) => `${column} = ?`)
                    .join(", ");
                const { where } = parseQuery(query);

                if (where.trim() === "") {
                    reject(new HandleError("WHERE clause is required for UPDATE operation", "SQLITE_ERROR"));
                    return;
                }

                db.run(`UPDATE ${table} SET ${setClause} ${where}`.trim() + ";", Object.values(data), (err) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    reject(new HandleError("WHERE clause is required for UPDATE operation", "SQLITE_ERROR"));
                    return;
                }

                db.run(`DELETE FROM ${table} ${where}`.trim() + ";", (err) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                    })
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
                        return reject(new HandleError(err.message, "SQLITE_ERROR", err));
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
                                    if (err) rejectAdd(new HandleError(err.message, "SQLITE_ERROR", err));
                                    else resolveAdd();
                                });
                            });
                        }
                    };

                    db.run(`CREATE TABLE IF NOT EXISTS ${table} (${Object.values(columnClause).join(", ")});`, async (err) => {
                        if (err) {
                            return reject(new HandleError(err.message, "SQLITE_ERROR", err));
                        }
                        await executeAddColumn().catch(reject);
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
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
                    else resolve();
                });
            });
        });
    }

    deleteDatabase(): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                db.close((err) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
                    else resolve();
                });
            });
        });
    }
}
```

## ``Database.Database``

A classe `Database.Database` é responsável por gerenciar a interação entre os dados e o armazenamento definido na implementação de `Database.Custom`. A seguir, a lista de métodos disponíveis:

```ts
import * as Database from 'base-database';
import * as sqlite3 from 'sqlite3';

class MyDatabase extends Database.Custom<sqlite3.Database> {
    // Implementação dos métodos abstratos
}

const db = new Database.Database(MyDatabase, "my-database");
```

### ``Database.Database.ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
db.ready(async (db) => {
  // Operações dentro da transação
});
```

### ``Database.Database.disconnect``

Método que desconecta do armazenamento de dados.

```ts
await db.disconnect();
```

### ``Database.Database.forTable``

Método que retorna uma instância de `Database.Table` para uma tabela específica.

```ts
const table = await db.forTable("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});
```

#### ``Database.Serialize``

O objeto `Database.Serialize` contém métodos para serialização de dados, para que possam ser armazenados e recuperados de forma segura correspondendo ao tipo de dados original.

Cada coluna da tabela deve ser definida com um objeto que contém as seguintes propriedades:

- ``type``: Tipo de dado da coluna.
- ``primaryKey``: Indica se a coluna é uma chave primária.
- ``autoIncrement``: Indica se a coluna é autoincrementável.
- ``notNull``: Indica se a coluna não pode ser nula.
- ``default``: Valor padrão da coluna.
- ``unique``: Indica se a coluna deve ser única.
- ``check``: Uma função que valida o valor da coluna, caso o valor não seja válido, a função deve lançar um erro, retornando uma instância de Error ou emitindo um erro throw.

```ts
const columns = {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true },
    email: { type: Database.Types.TEXT, unique: true, check: (value) => {
        if (!value.includes("@")) throw new Error("Invalid email");
    }},
};
```

### ``Database.Database.readyTable``

Método que prepara uma tabela para ser utilizada. Deve ser utilizado para garantir que a tabela esteja pronta para operações.

```ts
const table = db.readyTable("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});

table.ready(async (table) => {
    // Operações dentro da transação
});
```

Ou, inserindo uma promisse de instância de tabela:

```ts
const table = db.forTable("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});

db.readyTable(table).ready(async (table) => {
    // Operações dentro da transação
});
```

O método `readyTable` contém propriedades úteis com `ready`, `query`, `insert`, `selectAll`, `selectFirst`, `selectLast`, `length`, `on`, `once`, `off`, `offOnce` e `schema`. O método além ter uma resposta sincrona, seus métodos poderão ser úteis em situações que pretente simplificar a utilização de uma tabela sem a necessidade de utilizar o método `ready`, todos os médotos de `readyTable` já realizam essa tarefa, que são executados assim que a tabela estiver pronta para ser utilizada.

```ts
const table = db.readyTable("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});

table.query().where("name", Database.Operators.EQUAL, "John").get();
```

#### ``Database.Database.readyTable.ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
table.ready(async (table) => {
  // Operações dentro da transação
});
```

#### ``Database.Database.readyTable.query``

Método que retorna uma instância de `Database.Table.query` para a tabela. Visite a documentação de [`Database.Table.query`](#databasetablequery) para mais informações.

```ts
const query = table.query();
```

#### ``Database.Database.readyTable.insert``

Método que insere um registro na tabela.

```ts
await table.insert({
    id: 1,
    name: "John",
    date: new Date(),
    amount: 100.50,
    isValid: true,
    variant: BigInt(100)
});
```

#### ``Database.Database.readyTable.selectAll``

Método que seleciona todos os registros da tabela.

```ts
const rows = await table.selectAll();
```

#### ``Database.Database.readyTable.selectOne``

Método que seleciona um registro da tabela.

```ts
const row = await table.selectOne();
```

#### ``Database.Database.readyTable.selectFirst``

Método que seleciona o primeiro registro da tabela.

```ts
const row = await table.selectFirst();
```

#### ``Database.Database.readyTable.selectLast``

Método que seleciona o último registro da tabela.

```ts
const row = await table.selectLast();
```

#### ``Database.Database.readyTable.length``

Método que retorna o número de registros da tabela.

```ts
const count = await table.length();
```

#### ``Database.Database.readyTable.on``, ``Database.Database.readyTable.once``, ``Database.Database.readyTable.off`` e ``Database.Database.readyTable.offOnce``

Métodos para adicionar e remover eventos de uma tabela.

```ts
const onInsert = (row) => {
    console.log("Row inserted:", row);
};

table.on("insert", onInsert);

const onceInsert = (row) => {
    console.log("Row inserted once:", row);
};

table.once("insert", onceInsert);

table.off("insert", onInsert);

table.offOnce("insert", onceInsert);
```

#### ``Database.Database.readyTable.schema``

Realiza a mesma função que o método `Table.bindSchema`, visite a documentação de [`Database.Table.bindSchema`](#databasetablebindschema) para mais informações.

### ``Database.Database.table``

O mesmo que ``readyTable``, porém, aceita apenas parâmetros de string e um objeto de serialização.

```ts
const table = db.table("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});

table.ready(async (table) => {
    // Operações dentro da transação
});
```

### ``Database.Database.deleteTable``

Método que deleta uma tabela.

```ts
await db.deleteTable("my-table");
```

### ``Database.Database.deleteDatabase``

Método que deleta o banco de dados.

```ts
await db.deleteDatabase();
```

## ``Database.Table``

A classe `Database.Table` é responsável por gerenciar a interação entre os dados e uma tabela específica. A seguir, a lista de métodos disponíveis:

```ts
import * as Database from 'base-database';
import * as sqlite3 from 'sqlite3';

class MyDatabase extends Database.Custom<sqlite3.Database> {
    // Implementação dos métodos abstratos
}

const db = new Database.Database(MyDatabase, "my-database");

const table = await db.forTable("my-table", {
    id: { type: Database.Types.INTEGER, primaryKey: true },
    name: { type: Database.Types.TEXT, notNull: true },
    date: { type: Database.Types.DATETIME },
    amount: { type: Database.Types.FLOAT },
    isValid: { type: Database.Types.BOOLEAN, default: false },
    variant: { type: Database.Types.BIGINT, notNull: true }
});
```

### ``Database.Table.disconnect``

Método que desconecta do armazenamento de dados.

```ts
await table.disconnect();
```

### ``Database.Table.ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
await table.ready(async (table) => {
  // Operações dentro da transação
});
```

### ``Database.Table.getColumnType``

Método que retorna o tipo de uma coluna.

```ts
const type = table.getColumnType("name"); // "TEXT"
```

### ``Database.Table.getColumns``

Método que retorna as colunas da tabela.

```ts
const columns = table.getColumns();
```

### ``Database.Table.query``

Método que retorna uma instância de `Database.Query` para a tabela.

```ts
const query = table.query();
```

#### ``Database.Table.query.where``

Método que adiciona uma cláusula `WHERE` à consulta. Visite a documentação de [`Database.Operators`](#databaseoperators) para mais informações.

```ts
query.where("name", Database.Operators.EQUAL, "John");
query.where("date", Database.Operators.GREATER_THAN, new Date());
query.where("amount", Database.Operators.LESS_THAN_OR_EQUAL, 100.50);
query.where("isValid", Database.Operators.EQUAL, true);
query.where("variant", Database.Operators.BETWEEN, [100, 200]);
```

#### ``Database.Table.query.filter``

Método que adiciona uma cláusula `WHERE` à consulta.

```ts
query.filter({ name: "John", amount: 100.50 });
```

#### ``Database.Table.query.take``

Método que limita o número de registros retornados pela consulta.

```ts
query.take(10);
```

#### ``Database.Table.query.skip``

Método que pula um número de registros na consulta.

```ts
query.skip(10);
```

#### ``Database.Table.query.sort``

Método que ordena os registros da consulta.

```ts
query.sort("name");
query.sort("date", false);
```

#### ``Database.Table.query.order``

Método que ordena os registros da consulta.

```ts
query.order("name");
query.order("date", false);
```

#### ``Database.Table.query.columns``

Método que seleciona as colunas retornados pela consulta.

```ts
query.columns("name", "date");
```

#### ``Database.Table.query.get``

Método que executa a consulta e retorna os registros.

```ts
const rows = await query.get();
```

#### ``Database.Table.query.first``

Método que executa a consulta e retorna o primeiro registro.

```ts
const row = await query.first();
```

#### ``Database.Table.query.last``

Método que executa a consulta e retorna o último registro.

```ts
const row = await query.last();
```

#### ``Database.Table.query.one``

Método que executa a consulta e retorna um registro.

```ts
const row = await query.one();
```

#### ``Database.Table.query.exists``

Método que executa a consulta e verifica se um registro existe.

```ts
const exists = await query.exists();
```

#### ``Database.Table.query.count``

Método que executa a consulta e retorna o número de registros.

```ts
const count = await query.count();
```

#### ``Database.Table.query.length``

Método que executa a consulta e retorna o número de registros.

```ts
const length = await query.length();
```

#### ``Database.Table.query.set``

Método que executa a consulta e atualiza os registros.

```ts
await query.set({ name: "John" });
```

#### ``Database.Table.query.update``

Método que executa a consulta e atualiza os registros.

```ts
await query.update({ name: "John" });
```

#### ``Database.Table.query.delete``

Método que executa a consulta e deleta os registros.

```ts
await query.delete();
```

### ``Database.Table.bindSchema``
Mapear dados para suas próprias classes permite que você armazene e carregue objetos de/para o banco de dados sem que eles percam seu tipo de classe. Depois de mapear tabela para uma classe, você nunca mais precisará se preocupar com serialização ou desserialização dos objetos => Armazene um ``User``, obtenha um ``User``. Quaisquer métodos específicos de classe podem ser executados diretamente nos objetos que você obtém de volta da tabela, porque eles serão uma ``instanceof`` sua classe.

Por padrão, o **Base-Database** executa seu construtor de classe com um instantâneo dos dados para instanciar novos objetos e usa todas as propriedades da sua classe para serializá-los para armazenamento.

```ts
// User class implementation
class User {
    name: string;

    constructor(obj: Database.ExtractTableRow<typeof table>) {
        this.name = obj.name;
    }
}

// Mapping table to class
const UserTable = table.bindSchema(User);
```

Agora você pode fazer o seguinte:

```ts
let user = new User();
user.name = 'Ewout';

await UserTable.insert(user);

let users: User[] = await UserTable.selectAll();
// users[0] instanceof User === true
```

Se você não puder (ou não quiser) alterar o construtor da sua classe, adicione um método estático chamado createpara desserializar objetos armazenados:

```ts
class Pet {
    // Constructor that takes multiple arguments
    constructor(animal, name) {
        this.animal = animal;
        this.name = name;
    }

    // Static method that instantiates a Pet object
    static create(obj: Database.ExtractTableRow<typeof table>) {
        return new Pet(obj.animal, obj.name);
    }
}

// Mapping table to class
const PetTable = table.bindSchema(Pet);
```

Se você quiser alterar como seus objetos são serializados para armazenamento, adicione um método chamado ``serialize`` á sua classe. Você deve fazer isso se sua classe contiver propriedades que não devem ser serializadas (por exemplo, ``get`` propriedades).

```ts
class Pet {
    // Constructor that takes multiple arguments
    constructor(animal, name) {
        this.animal = animal;
        this.name = name;
    }

    // Static method that instantiates a Pet object
    static create(obj: Database.ExtractTableRow<typeof table>) {
        return new Pet(obj.animal, obj.name);
    }

    // Method that serializes a Pet object
    serialize(): Partial<Database.ExtractTableRow<typeof table>> {
        return {
            animal: this.animal,
            name: this.name,
        };
    }
}

// Mapping table to class
const PetTable = table.bindSchema(Pet);
```

Se você quiser usar outros métodos para instanciação e/ou serialização além dos padrões explicados acima, você pode especificá-los manualmente na ``bind`` chamada:

```ts
class Pet {
    // ...
    toDatabase(): Partial<Database.ExtractTableRow<typeof table>> {
        return {
            animal: this.animal,
            name: this.name
        }
    }

    static fromDatabase(obj: Database.ExtractTableRow<typeof table>) {
        return new Pet(obj.animal, obj.name);
    }
}

// Mapping table to class
const PetTable = table.bindSchema(Pet, {
    creator: Pet.fromDatabase,
    serializer: Pet.prototype.toDatabase
});
```

Se você deseja armazenar classes nativas ou de terceiros, ou não deseja estender as classes com métodos de (des)serialização:

```ts
// Mapping table to class
const RegExpTable = table.bindSchema(RegExp, {
    creator: (obj) => new RegExp(obj.pattern, obj.flags),
    serializer: (obj) => ({ pattern: obj.source, flags: obj.flags })
});
```

### ``Database.Table.selectAll``

Método que seleciona todos os registros da tabela.

```ts
const rows = await table.selectAll();
// ou
const rows = await table.selectAll(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
// ou
const rows = await table.selectAll(table.query().where("name", Database.Operators.EQUAL, "John").columns("name", "date")); // com cláusula WHERE e colunas específicas
// ou 
const rows = await table.selectAll(table.query().columns("name", "date")); // com colunas específicas mas sem cláusula WHERE
```

### ``Database.Table.selectOne``

Método que seleciona um registro da tabela.

```ts
const row = await table.selectOne();
// ou
const row = await table.selectOne(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
// ou
const row = await table.selectOne(table.query().where("name", Database.Operators.EQUAL, "John").columns("name", "date")); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectOne(table.query().columns("name", "date")); // com colunas específicas mas sem cláusula WHERE
// ou
const row = await table.selectOne(table.query().order("name")); // com ordenação
```

### ``Database.Table.selectFirst``

Método que seleciona o primeiro registro da tabela.

```ts
const row = await table.selectFirst();
// ou
const row = await table.selectFirst(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
// ou
const row = await table.selectFirst(table.query().where("name", Database.Operators.EQUAL, "John").columns("name", "date")); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectFirst(table.query().columns("name", "date")); // com colunas específicas mas sem cláusula WHERE
// ou
const row = await table.selectFirst(table.query().order("name")); // com ordenação
```

### ``Database.Table.selectLast``

Método que seleciona o último registro da tabela.

```ts
const row = await table.selectLast();
// ou
const row = await table.selectLast(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
// ou
const row = await table.selectLast(table.query().where("name", Database.Operators.EQUAL, "John").columns("name", "date")); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectLast(table.query().columns("name", "date")); // com colunas específicas mas sem cláusula WHERE
// ou
const row = await table.selectLast(table.query().order("name")); // com ordenação
```

### ``Database.Table.exists``

Método que verifica se um registro existe na tabela.

```ts
const exists = await table.exists(table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``Database.Table.insert``

Método que insere um registro na tabela.

```ts
await table.insert({
    id: 1,
    name: "John",
    date: new Date(),
    amount: 100.50,
    isValid: true,
    variant: BigInt(100)
});
```

### ``Database.Table.update``

Método que atualiza registros na tabela.

```ts
await table.update({
    name: "John Doe",
    amount: 200.50
}, table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``Database.Table.delete``

Método que deleta registros da tabela.

```ts
await table.delete(table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``Database.Table.length``

Método que retorna o número de registros da tabela.

```ts
const length = await table.length();
// ou
const length = await table.length(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
```

### ``Database.Table.on``, ``Database.Table.once``, ``Database.Table.off`` e ``Database.Table.offOnce``

Métodos para adicionar e remover eventos de uma tabela.

```ts
const onInsert = (row) => {
    console.log("Row inserted:", row);
};

table.on("insert", onInsert);

const onceInsert = (row) => {
    console.log("Row inserted once:", row);
};

table.once("insert", onceInsert);

table.off("insert", onInsert);

table.offOnce("insert", onceInsert);
```

Tipos de eventos aceitos: 

- ``insert``: Evento disparado após a inserção de um registro. 
  - ```(inserted: Database.Row) => void```
- ``update``: Evento disparado após a atualização de um registro. 
  - ```(updated: Database.Row[], previous: Database.Row[]) => void```
- ``delete``: Evento disparado após a deleção de um registro. 
  - ```(deleted: Database.Row[]) => void```

## ``Database.Operators``

O objeto `Database.Operators` contém os operadores disponíveis para a criação de cláusulas `WHERE`. A seguir, a lista de operadores disponíveis:

- ``EQUAL``: Igual a `=`.
- ``NOT_EQUAL``: Diferente de `!=`.
- ``GREATER_THAN``: Maior que `>`.
- ``GREATER_THAN_OR_EQUAL``: Maior ou igual a `>=`.
- ``LESS_THAN``: Menor que `<`.
- ``LESS_THAN_OR_EQUAL``: Menor ou igual a `<=`.
- ``BETWEEN``: Entre `BETWEEN`.
- ``NOT_BETWEEN``: Não entre `NOT BETWEEN`.
- ``LIKE``: Semelhante a `LIKE`.
- ``NOT_LIKE``: Não semelhante a `NOT LIKE`.
- ``IN``: Em `IN`.
- ``NOT_IN``: Não em `NOT IN`.

## ``Database.Types``

O objeto `Database.Types` contém os tipos de dados disponíveis para a criação de colunas. A seguir, a lista de tipos de dados disponíveis:

- ``INTEGER``: Número inteiro.
- ``FLOAT``: Número de ponto flutuante.
- ``TEXT``: Texto.
- ``BOOLEAN``: Booleano.
- ``DATETIME``: Data e hora.
- ``BIGINT``: Número inteiro grande.
- ``NULL``: Nulo.