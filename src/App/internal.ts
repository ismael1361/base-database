import { App } from "./App";
import { Server } from "./Server";

export const DEFAULT_ENTRY_NAME = "[DEFAULT]";

export const _apps = new Map<string, App>();

export const _servers = new Map<string, Server>();
