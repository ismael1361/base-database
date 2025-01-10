# Documentação da API de Banco de Dados SQL

Esta API permite interagir com o banco de dados SQL para gerenciar registros, tabelas e executar consultas. Abaixo estão as descrições detalhadas de cada endpoint.

---

## **Autenticação**

### POST /auth/login
- **Descrição**: Gera um token de autenticação para acesso à API.
- **Cabeçalhos**:
  - `Content-Type`: `application/json`
- **Corpo da Requisição**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Resposta**:
```json
{
  "token": "string"
}
```
- **Códigos de Status**:
  - 200: Sucesso
  - 401: Credenciais inválidas

---

## **Tabelas**

### GET /tables
- **Descrição**: Lista todas as tabelas disponíveis no banco de dados.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
- **Resposta**:
```json
[
  {
    "name": "string",
    "rowCount": "number"
  }
]
```
- **Códigos de Status**:
  - 200: Sucesso

### POST /tables
- **Descrição**: Cria uma nova tabela.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Corpo da Requisição**:
```json
{
  "name": "string",
  "columns": [
    { "name": "string", "type": "string", "nullable": "boolean" }
  ]
}
```
- **Resposta**:
```json
{
  "message": "Table created successfully"
}
```
- **Códigos de Status**:
  - 201: Tabela criada
  - 400: Erro de validação

---

## **Registros**

### GET /tables/{tableName}/records
- **Descrição**: Retorna todos os registros de uma tabela.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
- **Parâmetros de URL**:
  - `tableName`: Nome da tabela
- **Resposta**:
```json
[
  {
    "column1": "value1",
    "column2": "value2"
  }
]
```
- **Códigos de Status**:
  - 200: Sucesso
  - 404: Tabela não encontrada

### POST /tables/{tableName}/records
- **Descrição**: Adiciona um novo registro a uma tabela.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Parâmetros de URL**:
  - `tableName`: Nome da tabela
- **Corpo da Requisição**:
```json
{
  "column1": "value1",
  "column2": "value2"
}
```
- **Resposta**:
```json
{
  "message": "Record added successfully"
}
```
- **Códigos de Status**:
  - 201: Registro criado
  - 400: Erro de validação

### DELETE /tables/{tableName}/records/{recordId}
- **Descrição**: Remove um registro pelo ID.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
- **Parâmetros de URL**:
  - `tableName`: Nome da tabela
  - `recordId`: ID do registro
- **Resposta**:
```json
{
  "message": "Record deleted successfully"
}
```
- **Códigos de Status**:
  - 200: Registro removido
  - 404: Registro não encontrado

---

## **Consultas**

### POST /query
- **Descrição**: Executa uma consulta SQL direta.
- **Cabeçalhos**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Corpo da Requisição**:
```json
{
  "query": "string"
}
```
- **Resposta**:
```json
{
  "result": [
    {
      "column1": "value1",
      "column2": "value2"
    }
  ]
}
```
- **Códigos de Status**:
  - 200: Sucesso
  - 400: Erro na consulta

---

## **Erros Comuns**

### Códigos de Status
- 400: Requisição inválida
- 401: Não autorizado
- 403: Acesso negado
- 404: Recurso não encontrado
- 500: Erro interno no servidor

