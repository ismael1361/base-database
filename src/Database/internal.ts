import { Database } from "./";

export const _database: Map<string, Database.Database<any>> = new Map();

export const _serialize: Map<string, Database.Serialize> = new Map();

export const _tables: Map<string, Database.TableReady<any>> = new Map();
