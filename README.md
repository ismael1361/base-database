# Base-Database

**Base-Database** é uma biblioteca projetada para oferecer uma padronização eficiente no gerenciamento de dados, permitindo integração com diversos tipos de armazenamento. Através de sua estrutura modular, o desenvolvedor pode criar soluções personalizadas ao estender a classe abstrata `Database.Custom`, que serve como base para diferentes estratégias de armazenamento.

- [Base-Database](#base-database)
	- [Funcionalidades](#funcionalidades)
	- [Como funciona](#como-funciona)
	- [Exemplos de Uso](#exemplos-de-uso)
	- [Instalação](#instalação)
	- [Exemplo de Implementação](#exemplo-de-implementação)
	- [Aplicação](#aplicação)
		- [`initializeApp`](#initializeapp)
		- [`initializeServer`](#initializeserver)
	- [Banco de dados](#banco-de-dados)
		- [`createDatabase`](#createdatabase)
		- [``getDatabase``](#getdatabase)
			- [``ready``](#ready)
			- [``disconnect``](#disconnect)
			- [``table``](#table)
				- [``ready``](#ready-1)
				- [``query``](#query)
					- [``where``](#where)
					- [``filter``](#filter)
					- [``take``](#take)
					- [``skip``](#skip)
					- [``sort``](#sort)
					- [``order``](#order)
					- [``columns``](#columns)
					- [``get``](#get)
					- [``first``](#first)
					- [``last``](#last)
					- [``one``](#one)
					- [``exists``](#exists)
					- [``count``](#count)
					- [``length``](#length)
					- [``set``](#set)
					- [``update``](#update)
					- [``delete``](#delete)
				- [``insert``](#insert)
				- [``selectAll``](#selectall)
				- [``selectOne``](#selectone)
				- [``selectFirst``](#selectfirst)
				- [``selectLast``](#selectlast)
				- [``length``](#length-1)
				- [``on``, ``once``, ``off`` e ``offOnce``](#on-once-off-e-offonce)
				- [``schema``](#schema)
				- [``bindSchema``](#bindschema)
			- [``deleteTable``](#deletetable)
			- [``deleteDatabase``](#deletedatabase)
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

A seguir, um exemplo de implementação de uma classe personalizada que estende `Database.Custom` e criação de banco de dados na estrutura de aplicação usando a propriedate `initializeApp`:

```ts
import { Database, initializeApp, getDatabase } from 'base-database';

const app = initializeApp();

class MyDatabase extends Database.Custom {
  // Implementação dos métodos abstratos
}

const db = app.createDatabase({
  database: ":memory:",
  custom: MyDatabase,
  tables: {
    test: Database.columns({
      name: {
        type: Database.Types.TEXT,
      },
      gender: {
        type: Database.Types.TEXT,
        options: ["Female", "Male", "Other"] as const,
      },
      createdAt: {
        type: Database.Types.DATETIME,
        default: () => new Date(),
      },
    }),
  },
});

export type MainDatabase = typeof db;
```

A partir desse ponto, é possível utilizar os métodos de `getDatabase` para interagir com os dados de forma padronizada. Consulte a documentenção de [`Database.Custom`](#databasecustom) para mais informações sobre a implementação de uma classe personalizada.

## Aplicação

A aplicação é responsável por gerenciar o banco de dados e outros serviços. A aplicação é utilizada para centralizar a gestão de dados e garantir a integridade das operações.

### `initializeApp`

O método `initializeApp` é responsável por criar uma instância de aplicação para gerenciar o banco de dados e outros serviços. A aplicação é utilizada para centralizar a gestão de dados e garantir a integridade das operações.

```ts
import { initializeApp } from 'base-database';

const app = initializeApp();
```

O método `initializeApp` é mais focado para operações locais e simplificada, para métodos mais complexos, é recomendado utilizar a classe `initializeServer`.

### `initializeServer`

O método `initializeServer` é responsável por criar uma instância de servidor para gerenciar o banco de dados e outros serviços. O servidor é utilizado para centralizar a gestão de dados e garantir a integridade das operações.

```ts
import { initializeServer } from 'base-database';

const server = initializeServer();
```

## Banco de dados

Para gerenciar os dados, é necessário criar uma classe que estenda `Database.Custom` e implemente os métodos abstratos e configurar as tabelas que serão utilizadas. Todas as configurações devem ser aplicadas diretamente na aplicação criada, usando o método `createDatabase` da instância de aplicação por através do método `initializeApp` ou `initializeServer`.

### `createDatabase`

O método `createDatabase` é responsável por criar uma instância de banco de dados com as configurações definidas. O método deve receber um objeto com as seguintes propriedades:

```ts
import { Database, initializeApp } from 'base-database';

const app = initializeApp();

class MyDatabase extends Database.Custom {
  // Implementação dos métodos abstratos
}

const db = app.createDatabase({
  database: ":memory:",
  custom: MyDatabase,
  tables: {
    myTable: Database.columns({
      name: {
        type: Database.Types.TEXT,
      },
      gender: {
        type: Database.Types.TEXT,
        options: ["Female", "Male", "Other"] as const,
      },
      createdAt: {
        type: Database.Types.DATETIME,
        default: () => new Date(),
      },
    }),
  },
});

export type MainDatabase = typeof db;
```

> Note que estamos exportando o tipo `MainDatabase` para que possamos utilizar o tipo do banco de dados para garantir a integridade dos dados por meio do TypeScript.

O método `Database.columns` é responsável por criar um objeto de serialização de dados para definir as colunas de uma tabela, para que possam ser armazenados e recuperados de forma segura correspondendo ao tipo de dados original.

Cada coluna da tabela deve ser definida com um objeto que contém as seguintes propriedades:

- ``type``: Tipo de dado da coluna.
- ``primaryKey``: Indica se a coluna é uma chave primária.
- ``autoIncrement``: Indica se a coluna é autoincrementável.
- ``notNull``: Indica se a coluna não pode ser nula.
- ``default``: Valor padrão da coluna.
- ``unique``: Indica se a coluna deve ser única.
- ``check``: Uma função que valida o valor da coluna, caso o valor não seja válido, a função deve lançar um erro, retornando uma instância de Error ou emitindo um erro throw.
- ``options``: Uma lista de opções válidas para a coluna.

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
  options: { type: Database.Types.TEXT, options: ["Option 1", "Option 2", "Option 3"] as const },
};
```

O objeto `Database.Types` contém os tipos de dados disponíveis para a criação de colunas. A seguir, a lista de tipos de dados disponíveis:

- ``INTEGER``: Número inteiro.
- ``FLOAT``: Número de ponto flutuante.
- ``TEXT``: Texto.
- ``BOOLEAN``: Booleano.
- ``DATETIME``: Data e hora.
- ``BIGINT``: Número inteiro grande.
- ``NULL``: Nulo.

### ``getDatabase``

O método `getDatabase` é responsável por gerenciar a interação entre os dados e o armazenamento definido na implementação de `Database.Custom`.

```ts
import { getDatabase } from 'base-database';
import { MainDatabase } from './database';

const db = getDatabase<MainDatabase>();
```

#### ``ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
db.ready(async (db) => {
  // Operações dentro da transação
});
```

#### ``disconnect``

Método que desconecta do armazenamento de dados.

```ts
await db.disconnect();
```

#### ``table``

O método `table` contém propriedades úteis com `ready`, `query`, `insert`, `selectAll`, `selectFirst`, `selectLast`, `length`, `on`, `once`, `off`, `offOnce` e `schema`. O método além ter uma resposta sincrona, seus métodos poderão ser úteis em situações que pretente simplificar a utilização de uma tabela sem a necessidade de utilizar o método `ready`, todos os médotos de `readyTable` já realizam essa tarefa, que são executados assim que a tabela estiver pronta para ser utilizada.

```ts
const table = db.table("myTable");

table.query().where("name", Database.Operators.EQUAL, "John").get();
```

##### ``ready``

Método que executa uma função dentro de uma transação. Deve ser utilizado para garantir que a operação seja realizada de forma segura.

```ts
table.ready(async (table) => {
  // Operações dentro da transação
});
```

##### ``query``

Método que retorna uma instância de `Database.Query` para a tabela.

```ts
const query = table.query();
```

###### ``where``

Método que adiciona uma cláusula `WHERE` à consulta.

```ts
query.where("name", Database.Operators.EQUAL, "John");
query.where("date", Database.Operators.GREATER_THAN, new Date());
query.where("amount", Database.Operators.LESS_THAN_OR_EQUAL, 100.50);
query.where("isValid", Database.Operators.EQUAL, true);
query.where("variant", Database.Operators.BETWEEN, [100, 200]);
query.where("email", Database.Operators.LIKE, "%@gmail.com");
query.where("email", Database.Operators.LIKE, new RegExp(".*@gmail.com"));
```

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

###### ``filter``

Método que adiciona uma cláusula `WHERE` à consulta, o mesmo que `where`.

```ts
query.filter({ name: "John", amount: 100.50 });
```

###### ``take``

Método que limita o número de registros retornados pela consulta.

```ts
query.take(10);
```

###### ``skip``

Método que pula um número de registros na consulta.

```ts
query.skip(10);
```

###### ``sort``

Método que ordena os registros da consulta.

```ts
query.sort("name");
query.sort("date", false);
```

###### ``order``

Método que ordena os registros da consulta.

```ts
query.order("name");
query.order("date", false);
```

###### ``columns``

Método que seleciona as colunas retornados pela consulta.

```ts
query.columns("name", "date");
```

###### ``get``

Método que executa a consulta e retorna os registros.

```ts
const rows = await query.get();
```

###### ``first``

Método que executa a consulta e retorna o primeiro registro.

```ts
const row = await query.first();
```

###### ``last``

Método que executa a consulta e retorna o último registro.

```ts
const row = await query.last();
```

###### ``one``

Método que executa a consulta e retorna um registro.

```ts
const row = await query.one();
```

###### ``exists``

Método que executa a consulta e verifica se um registro existe.

```ts
const exists = await query.exists();
```

###### ``count``

Método que executa a consulta e retorna o número de registros.

```ts
const count = await query.count();
```

###### ``length``

Método que executa a consulta e retorna o número de registros.

```ts
const length = await query.length();
```

###### ``set``

Método que executa a consulta e atualiza os registros.

```ts
await query.set({ name: "John" });
```

###### ``update``

Método que executa a consulta e atualiza os registros.

```ts
await query.update({ name: "John" });
```

###### ``delete``

Método que executa a consulta e deleta os registros.

```ts
await query.delete();
```

##### ``insert``

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

##### ``selectAll``

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

##### ``selectOne``

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

##### ``selectFirst``

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

##### ``selectLast``

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

##### ``length``

Método que retorna o número de registros da tabela.

```ts
const count = await table.length();
```

##### ``on``, ``once``, ``off`` e ``offOnce``

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

##### ``schema``

Realiza a mesma função que o método `bindSchema`.

##### ``bindSchema``

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

#### ``deleteTable``

Método que deleta uma tabela.

```ts
await db.deleteTable("myTable");
```

#### ``deleteDatabase``

Método que deleta o banco de dados.

```ts
await db.deleteDatabase();
```

### ``Database.Custom<db = never>``

A classe abstrata `Database.Custom` define os métodos necessários para a implementação de uma solução personalizada de armazenamento. A seguir, a lista de métodos que devem ser implementados:

```ts
import { Database } from 'base-database';
import * as sqlite3 from 'sqlite3';

class MyDatabase extends Database.Custom<sqlite3.Database> {
  // Implementação dos métodos abstratos
}
```

#### ``constructor(database: string)``

Construtor da classe personalizada. Deve receber o nome do banco de dados como parâmetro.

```ts
constructor(database: string) {
  // Implementação do construtor
}
```

#### ``connect(database: string): Promise<db>``

Método responsável por conectar ao armazenamento de dados. Deve retornar uma `Promise` que resolve com o objeto de conexão.

```ts
import * as sqlite3 from 'sqlite3';

// Código anterior....

connect(database: string): Promise<sqlite3.Database> {
  // Implementação da conexão
}
```

#### ``disconnect(): Promise<void>``

Método responsável por desconectar do armazenamento de dados. Deve retornar uma `Promise` que resolve após a desconexão.

```ts
disconnect(): Promise<void> {
  // Implementação da desconexão
}
```

#### ``selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>>``

Método responsável por selecionar todos os registros de uma tabela. Deve retornar uma `Promise` que resolve com um array de registros.

```ts
selectAll(table: string, query?: Database.QueryOptions): Promise<Array<Database.Row>> {
  // Implementação da seleção
}
```

#### ``selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar um registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectOne(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

#### ``selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar o primeiro registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectFirst(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

#### ``selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null>``

Método responsável por selecionar o último registro de uma tabela. Deve retornar uma `Promise` que resolve com um registro ou `null`.

```ts
selectLast(table: string, query?: Database.QueryOptions): Promise<Database.Row | null> {
  // Implementação da seleção
}
```

#### ``insert(table: string, data: Database.Row): Promise<Database.Row>``

Método responsável por inserir um registro em uma tabela. Deve retornar uma `Promise` que resolve após a inserção.

```ts
insert(table: string, data: Database.Row): Promise<Database.Row> {
  // Implementação da inserção
}
```

#### ``update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void>``

Método responsável por atualizar registros em uma tabela. Deve retornar uma `Promise` que resolve após a atualização.

```ts
update(table: string, data: Partial<Database.Row>, query: Database.QueryOptions): Promise<void> {
  // Implementação da atualização
}
```

#### ``delete(table: string, query: Database.QueryOptions): Promise<void>``

Método responsável por deletar registros de uma tabela. Deve retornar uma `Promise` que resolve após a deleção.

```ts
delete(table: string, query: Database.QueryOptions): Promise<void> {
  // Implementação da deleção
}
```

#### ``length(table: string, query?: Database.QueryOptions): Promise<number>``

Método responsável por obter o número de registros de uma tabela. Deve retornar uma `Promise` que resolve com o número de registros.

```ts
length(table: string, query?: Database.QueryOptions): Promise<number> {
  // Implementação do cálculo do número de registros
}
```

#### ``createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void>``

Método responsável por criar uma tabela. Deve retornar uma `Promise` que resolve após a criação da tabela.

```ts
createTable(table: string, columns: Database.SerializeDataType<any>): Promise<void> {
  // Implementação da criação da tabela
}
```

#### ``deleteTable(table: string): Promise<void>``

Método responsável por deletar uma tabela. Deve retornar uma `Promise` que resolve após a deleção da tabela.

```ts
deleteTable(table: string): Promise<void> {
  // Implementação da deleção da tabela
}
```

#### ``deleteDatabase(): Promise<void>``

Método responsável por deletar o banco de dados. Deve retornar uma `Promise` que resolve após a deleção do banco de dados.

```ts
deleteDatabase(): Promise<void> {
  // Implementação da deleção do banco de dados
}
```

#### Exemplo utilizando SQLite

Para utilizar SQLite como armazenamento, é necessário instalar o pacote `sqlite3`:

```bash
npm install sqlite3
```

Em seguida, implemente a classe personalizada para SQLite:

```ts
import Database, { SQLiteRegex } from 'base-database';
import sqlite3 from "sqlite3";

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
        const db = (this.db = new sqlite3.Database(database));
        db.loadExtension(SQLiteRegex.getLoadablePath());
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
```
