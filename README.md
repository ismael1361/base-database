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

### ``selectAll<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Array<Database.Row>>``

Método responsável por selecionar todos os registros de uma tabela. Deve retornar uma `Promise` que resolve com um array de registros.

```ts
selectAll<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Array<Database.Row>> {
  // Implementação da seleção
}
```

### ``selectOne<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null>``

Método responsável por selecionar um registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectOne<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

### ``selectFirst<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null>``

Método responsável por selecionar o primeiro registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectFirst<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

### ``selectLast<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null>``

Método responsável por selecionar o último registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectLast<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
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

### ``update(table: string, data: Partial<Database.Row>, where: Database.Wheres): Promise<void>``

Método responsável por atualizar registros em uma tabela. Deve retornar uma `Promise` que resolve após a atualização.

```ts
update(table: string, data: Partial<Database.Row>, where: Database.Wheres): Promise<void> {
  // Implementação da atualização
}
```

### ``delete(table: string, where: Database.Wheres): Promise<void>``

Método responsável por deletar registros de uma tabela. Deve retornar uma `Promise` que resolve após a deleção.

```ts
delete(table: string, where: Database.Wheres): Promise<void> {
  // Implementação da deleção
}
```

### ``length(table: string, where?: Database.Wheres): Promise<number>``

Método responsável por obter o número de registros de uma tabela. Deve retornar uma `Promise` que resolve com o número de registros.

```ts
length(table: string, where?: Database.Wheres): Promise<number> {
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

    selectAll<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Array<Database.Row>> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = Array.isArray(where) ? where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ") : "";

                const columnClause = columns ? columns.join(", ") : "*";

                db.all(`SELECT ${columnClause} FROM ${table}${Array.isArray(where) ? ` WHERE ${whereClause}` : ""};`, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        });
    }

    selectOne<C>(table: string, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = Array.isArray(where) ? where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ") : "";

                const columnClause = columns ? columns.join(", ") : "*";

                db.get(`SELECT ${columnClause} FROM ${table}${Array.isArray(where) ? ` WHERE ${whereClause}` : ""};`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        });
    }

    selectFirst<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = Array.isArray(where) ? where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ") : "";

                const columnClause = columns ? columns.join(", ") : "*";

                db.get(`SELECT ${columnClause} FROM ${table}${Array.isArray(where) ? ` WHERE ${whereClause}` : ""}${by ? ` ORDER BY ${by} ASC` : ""};`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        });
    }

    selectLast<C>(table: string, by?: PropertyKey, columns?: Array<C>, where?: Database.Wheres): Promise<Database.Row | null> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = Array.isArray(where) ? where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ") : "";

                const columnClause = columns ? columns.join(", ") : "*";

                db.get(`SELECT ${columnClause} FROM ${table}${Array.isArray(where) ? ` WHERE ${whereClause}` : ""}${by ? ` ORDER BY ${by} DESC` : ""};`, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
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

    update(table: string, data: Partial<Database.Row>, where: Database.Wheres): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const setClause = Object.entries(data).map(([column, value]) => `${column} = '${value}'`).join(", ");
                const whereClause = where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ");

                db.run(`UPDATE ${table} SET ${setClause} WHERE ${whereClause};`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    delete(table: string, where: Database.Wheres): Promise<void> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ");

                db.run(`DELETE FROM ${table} WHERE ${whereClause};`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    length(table: string, where?: Database.Wheres): Promise<number> {
        return this.ready(async (db) => {
            return new Promise((resolve, reject) => {
                const whereClause = Array.isArray(where) ? where.map((w) => `${w.column} ${w.operator} ${w.value}`).join(" AND ") : "";

                db.get(`SELECT COUNT(*) AS count FROM ${table}${Array.isArray(where) ? ` WHERE ${whereClause}` : ""};`, (err, row) => {
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

### ``wheres``

Método que retorna um objeto de `Database.Wheres` para facilitar a criação de cláusulas `WHERE`.

```ts
const where = table.wheres({
    column: "id",
    operator: Database.Operators.EQUAL,
    value: "John"
}, {
    column: "date",
    operator: Database.Operators.GREATER_THAN,
    value: new Date()
});
```

### ``selectAll``

Método que seleciona todos os registros da tabela.

```ts
const rows = await table.selectAll();
// ou
const rows = await table.selectAll(where); // com cláusula WHERE
// ou
const rows = await table.selectAll(where, ["name", "date"]); // com cláusula WHERE e colunas específicas
// ou 
const rows = await table.selectAll(undefined, ["name", "date"]); // com colunas específicas mas sem cláusula WHERE
```

### ``selectOne``

Método que seleciona um registro da tabela.

```ts
const row = await table.selectOne();
// ou
const row = await table.selectOne(where); // com cláusula WHERE
// ou
const row = await table.selectOne(where, ["name", "date"]); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectOne(undefined, ["name", "date"]); // com colunas específicas mas sem cláusula WHERE
```

### ``selectFirst``

Método que seleciona o primeiro registro da tabela.

```ts
const row = await table.selectFirst();
// ou
const row = await table.selectFirst(where); // com cláusula WHERE
// ou
const row = await table.selectFirst(where, ["name", "date"]); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectFirst(undefined, ["name", "date"]); // com colunas específicas mas sem cláusula WHERE
```

### ``selectLast``

Método que seleciona o último registro da tabela.

```ts
const row = await table.selectLast();
// ou
const row = await table.selectLast(where); // com cláusula WHERE
// ou
const row = await table.selectLast(where, ["name", "date"]); // com cláusula WHERE e colunas específicas
// ou
const row = await table.selectLast(undefined, ["name", "date"]); // com colunas específicas mas sem cláusula WHERE
```

### ``exists``

Método que verifica se um registro existe na tabela.

```ts
const exists = await table.exists(where);
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
}, where);
```

### ``delete``

Método que deleta registros da tabela.

```ts
await table.delete(where);
```

### ``length``

Método que retorna o número de registros da tabela.

```ts
const length = await table.length();
// ou
const length = await table.length(where); // com cláusula WHERE
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