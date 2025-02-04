import * as Browser from "./browser";
import express, { Application } from "express";
export { HttpServerFunction, ServerSettings } from "./browser";
export declare const serverSupported = true;
export declare const instanceApplication: express.Application;
export declare class ServerManager extends Browser.ServerManager {
    readonly allowOrigin: string;
    readonly router: express.Router;
    constructor(http_server?: Browser.HttpServerFunction, app?: Application, allowOrigin?: string);
    setupMiddleware(app: Application): void;
    setupRoutes(app: Application): void;
}
export declare class Server extends Browser.Server {
    readonly settings: Browser.ServerSettings;
    readonly serverSupported: boolean;
    private _server;
    constructor(settings: Browser.ServerSettings);
    get server(): ServerManager;
    initialize(): void;
    createServer(server: Browser.HttpServerFunction): ServerManager;
    createServer(server: Browser.HttpServerFunction, app: Application): ServerManager;
    createServer(app: Application): ServerManager;
    createServer(): ServerManager;
}
//# sourceMappingURL=index.d.ts.map