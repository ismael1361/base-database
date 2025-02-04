import { App } from "../App/App";
import BasicEventEmitter from "basic-event-emitter";
import { ERROR_FACTORY } from "../Error";
export const serverSupported = false;
export class ServerManager extends BasicEventEmitter {
    server;
    app;
    constructor() {
        super();
    }
    async initialize(server, app) {
        this.server = server;
        this.app = app;
        this.setupMiddleware(this.app);
        this.setupRoutes(this.app);
        this.prepared = true;
    }
    get host() {
        if (!this.server) {
            throw ERROR_FACTORY.create("ServerManager", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
        }
        return this.server.address();
    }
    get port() {
        if (!this.server) {
            throw ERROR_FACTORY.create("ServerManager", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
        }
        return this.server.address();
    }
    listen(...args) {
        this.ready(() => {
            this.server?.listen.apply(this.server, args);
        });
        return this;
    }
}
export class Server extends App {
    settings;
    isServer = true;
    serverSupported = false;
    constructor(settings) {
        super(settings, false);
        this.settings = settings;
        this.initialize();
    }
    get server() {
        throw ERROR_FACTORY.create("Server", "server-not-supported" /* Errors.SERVER_NOT_SUPPORTED */);
    }
    initialize() {
        super.initialize();
    }
    createServer(server, app) {
        throw ERROR_FACTORY.create("Server", "server-not-supported" /* Errors.SERVER_NOT_SUPPORTED */);
    }
}
//# sourceMappingURL=browser.js.map