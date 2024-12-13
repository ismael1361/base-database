# Base-Database

**Base-Database** é uma biblioteca projetada para oferecer uma padronização eficiente no gerenciamento de dados, permitindo integração com diversos tipos de armazenamento. Através de sua estrutura modular, o desenvolvedor pode criar soluções personalizadas ao estender a classe abstrata `Database.Custom`, que serve como base para diferentes estratégias de armazenamento.

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

### ``insert(table: string, data: Database.Row): Promise<void>``

Método responsável por inserir um registro em uma tabela. Deve retornar uma `Promise` que resolve após a inserção.

```ts
insert(table: string, data: Database.Row): Promise<void> {
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

### ``createTable(table: string, columns: Database.SerializeDatatype<any>): Promise<void>``

Método responsável por criar uma tabela. Deve retornar uma `Promise` que resolve após a criação da tabela.

```ts
createTable(table: string, columns: Database.SerializeDatatype<any>): Promise<void> {
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

const parseQuery = (query?: Database.QueryOptions) => {
    if (!query) return { columns: "*", where: "", order: "", limit: "", offset: "" };

    const whereClause =
        Array.isArray(query.wheres) && query.wheres.length > 0
            ? query.wheres.map((w) => `${w.column} ${w.operator} ${typeof w.compare === "string" ? `'${w.compare}'` : w.compare}`).join(" AND ")
            : "";

    const columnClause = Array.isArray(query.wheres) && query.columns.length > 0 ? query.columns.join(", ") : "*";

    const orderClause = Array.isArray(query.order) && query.order.length > 0 ? query.order.map(({ column, ascending }) => `${String(column)} ${ascending ? "ASC" : "DESC"}`).join(", ") : "";

    return {
        columns: columnClause,
        where: whereClause.trim() === "" ? "" : `WHERE ${whereClause}`,
        order: orderClause.trim() === "" ? "" : `ORDER BY ${orderClause.trim()}`,
        limit: query.take ? `LIMIT ${query.take}` : "",
        offset: query.skip ? `OFFSET ${query.skip}` : "",
    };
};

class SQLite extends Database.Custom<sqlite3.Database> {
	private db: sqlite3.Database | undefined;

   connect(database: string): Promise<sqlite3.Database> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(database, (err) => {
                if (err) reject(err);
                else resolve(this.db);
            });
        });
    }

    disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else {
                reject(new Error('Database not connected'));
            }
        });
    }

    selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { columns, where, order, limit, offset } = parseQuery(query);

                db.all(`SELECT ${columns} FROM ${table} ${where} ${order} ${limit} ${offset}`.trim() + ";", (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        });
    }

    selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { columns, where, order } = parseQuery(query);

                db.get(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ";", (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        });
    }

    selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { columns, where, order } = parseQuery(query);

                db.get(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ";", (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        });
    }

    selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                let { columns, where, order } = parseQuery(query);

                where = (where.trim() + (where.trim() === "" ? "WHERE" : " AND ") + ` rowid = (SELECT MAX(rowid) FROM ${table})`).trim();

                db.get<Database.Row | null | undefined>(`SELECT ${columns} FROM ${table} ${where} ${order}`.trim() + ";", (err, row) => {
                    if (err) reject(new HandleError(err.message, "SQLITE_ERROR", err));
                    else resolve(row ?? null);
                });
            });
        });
    }

    insert(table: string, data: Database.Row): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const columns = Object.keys(data).join(", ");
                const values = Object.values(data).map((v) => `'${v}'`).join(", ");

                db.run(`INSERT INTO ${table} (${columns}) VALUES (${values});`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const setClause = Object.entries(data).map(([column, value]) => `${column} = '${value}'`).join(", ");
                
                const { where } = parseQuery(query);

                db.run(`UPDATE ${table} SET ${setClause} ${where}`.trim() + ";", (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    delete(table: string, query: Database.QueryOptions): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { where } = parseQuery(query);

                db.run(`DELETE FROM ${table} ${where}`.trim() + ";", (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    length(table: string, query?: Database.QueryOptions): Promise<number> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const { where } = parseQuery(query);

                db.get(`SELECT COUNT(*) AS count FROM ${table} ${where}`.trim() + ";", (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });
        });
    }

    createTable(table: string, columns: Database.SerializeDatatype<any>): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const columnClause = Object.entries(columns).map(([column, {type, primaryKey, autoIncrement, notNull, default, unique}]) => {
                    let clause = `${column} ${type}`;

                    if (primaryKey) clause += " PRIMARY KEY";
                    if (autoIncrement) clause += " AUTOINCREMENT";
                    if (notNull) clause += " NOT NULL";
                    if (default) clause += ` DEFAULT ${default}`;
                    if (unique) clause += " UNIQUE";

                    return clause;
                }).join(", ");

                db.run(`CREATE TABLE IF NOT EXISTS ${table} (${columnClause});`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    deleteTable(table: string): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                db.run(`DROP TABLE IF EXISTS ${table};`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    deleteDatabase(): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                db.close((err) => {
                    if (err) reject(err);
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

### ``ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
db.ready(async (db) => {
  // Operações dentro da transação
});
```

### ``disconnect``

Método que desconecta do armazenamento de dados.

```ts
await db.disconnect();
```

### ``forTable``

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

### ``readyTable``

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

### ``table``

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

### ``deleteTable``

Método que deleta uma tabela.

```ts
await db.deleteTable("my-table");
```

### ``deleteDatabase``

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

### ``disconnect``

Método que desconecta do armazenamento de dados.

```ts
await table.disconnect();
```

### ``ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
await table.ready(async (table) => {
  // Operações dentro da transação
});
```

### ``getColumnType``

Método que retorna o tipo de uma coluna.

```ts
const type = table.getColumnType("name"); // "TEXT"
```

### ``getColumns``

Método que retorna as colunas da tabela.

```ts
const columns = table.getColumns();
```

### ``query``

Método que retorna uma instância de `Database.Query` para a tabela.

```ts
const query = table.query();
```

#### ``where``

Método que adiciona uma cláusula `WHERE` à consulta.

```ts
query.where("name", Database.Operators.EQUAL, "John");
query.where("date", Database.Operators.GREATER_THAN, new Date());
query.where("amount", Database.Operators.LESS_THAN_OR_EQUAL, 100.50);
query.where("isValid", Database.Operators.EQUAL, true);
query.where("variant", Database.Operators.BETWEEN, [100, 200]);
```

#### ``filter``

Método que adiciona uma cláusula `WHERE` à consulta.

```ts
query.filter({ name: "John", amount: 100.50 });
```

#### ``take``

Método que limita o número de registros retornados pela consulta.

```ts
query.take(10);
```

#### ``skip``

Método que pula um número de registros na consulta.

```ts
query.skip(10);
```

#### ``sort``

Método que ordena os registros da consulta.

```ts
query.sort("name");
query.sort("date", false);
```

#### ``order``

Método que ordena os registros da consulta.

```ts
query.order("name");
query.order("date", false);
```

#### ``columns``

Método que seleciona as colunas retornados pela consulta.

```ts
query.columns("name", "date");
```

#### ``get``

Método que executa a consulta e retorna os registros.

```ts
const rows = await query.get();
```

#### ``first``

Método que executa a consulta e retorna o primeiro registro.

```ts
const row = await query.first();
```

#### ``last``

Método que executa a consulta e retorna o último registro.

```ts
const row = await query.last();
```

#### ``one``

Método que executa a consulta e retorna um registro.

```ts
const row = await query.one();
```

#### ``exists``

Método que executa a consulta e verifica se um registro existe.

```ts
const exists = await query.exists();
```

#### ``count``

Método que executa a consulta e retorna o número de registros.

```ts
const count = await query.count();
```

#### ``length``

Método que executa a consulta e retorna o número de registros.

```ts
const length = await query.length();
```

#### ``set``

Método que executa a consulta e atualiza os registros.

```ts
await query.set({ name: "John" });
```

#### ``update``

Método que executa a consulta e atualiza os registros.

```ts
await query.update({ name: "John" });
```

#### ``delete``

Método que executa a consulta e deleta os registros.

```ts
await query.delete();
```

### ``selectAll``

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

### ``selectOne``

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

### ``selectFirst``

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

### ``selectLast``

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

### ``exists``

Método que verifica se um registro existe na tabela.

```ts
const exists = await table.exists(table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``insert``

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

### ``update``

Método que atualiza registros na tabela.

```ts
await table.update({
    name: "John Doe",
    amount: 200.50
}, table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``delete``

Método que deleta registros da tabela.

```ts
await table.delete(table.query().where("name", Database.Operators.EQUAL, "John"));
```

### ``length``

Método que retorna o número de registros da tabela.

```ts
const length = await table.length();
// ou
const length = await table.length(table.query().where("name", Database.Operators.EQUAL, "John")); // com cláusula WHERE
```

## ``Database.Operators``

O objeto `Database.Operators` contém os operadores disponíveis para a criação de cláusulas `WHERE`. A seguir, a lista de operadores disponíveis:

- ``EQUAL``: Igual a `=`.
- ``NOT_EQUAL``: Diferente de `!=`.
- ``GREATER_THAN``: Maior que `>`.
- ``GREATER_THAN_OR_EQUAL``: Maior ou igual a `>=`.
- ``LESS_THAN``: Menor que `<`.
- ``LESS_THAN_OR_EQUAL``: Menor ou igual a `<=`.
- ``BETWEEN``: Entre `BETWEEN`.
- ``LIKE``: Semelhante a `LIKE`.
- ``IN``: Em `IN`.

## ``Database.Types``

O objeto `Database.Types` contém os tipos de dados disponíveis para a criação de colunas. A seguir, a lista de tipos de dados disponíveis:

- ``INTEGER``: Número inteiro.
- ``FLOAT``: Número de ponto flutuante.
- ``TEXT``: Texto.
- ``BOOLEAN``: Booleano.
- ``DATETIME``: Data e hora.
- ``BIGINT``: Número inteiro grande.
- ``NULL``: Nulo.