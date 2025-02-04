import { AppSettings, App } from "../App/App";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
import type { Application } from "express";
import BasicEventEmitter from "basic-event-emitter";
import type { ListenOptions } from "net";
export declare const serverSupported = false;
export type HttpServerFunction = (app: Application) => HttpServer | HttpsServer;
export interface ServerSettings extends AppSettings {
    readonly name?: string;
}
export declare abstract class ServerManager extends BasicEventEmitter<{}> {
    private server;
    private app;
    constructor();
    initialize(server: HttpServer, app: Application): Promise<void>;
    get host(): string;
    get port(): number;
    abstract setupMiddleware(app: Application): void;
    abstract setupRoutes(app: Application): void;
    listen(port?: number, hostname?: string, listeningListener?: () => void): this;
    listen(port?: number, listeningListener?: () => void): this;
    listen(path: string, listeningListener?: () => void): this;
    listen(options: ListenOptions, listeningListener?: () => void): this;
}
export declare class Server extends App {
    readonly settings: ServerSettings;
    readonly isServer: boolean;
    readonly serverSupported: boolean;
    constructor(settings: ServerSettings);
    get server(): ServerManager;
    initialize(): void;
    createServer(server: HttpServerFunction): ServerManager;
    createServer(server: HttpServerFunction, app: Application): ServerManager;
    createServer(app: Application): ServerManager;
    createServer(): ServerManager;
}
//# sourceMappingURL=browser.d.ts.map