import { Database } from "./";

export const _database: Map<PropertyKey, Database.Database<any>> = new Map();

export const _serialize: Map<PropertyKey, Database.Serialize<any>> = new Map();

export const _tables: Map<PropertyKey, Database.TableReady<any>> = new Map();
