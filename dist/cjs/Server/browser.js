"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.ServerManager = exports.serverSupported = void 0;
const App_1 = require("../App/App");
const basic_event_emitter_1 = __importDefault(require("basic-event-emitter"));
const Error_1 = require("../Error");
exports.serverSupported = false;
class ServerManager extends basic_event_emitter_1.default {
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
            throw Error_1.ERROR_FACTORY.create("ServerManager", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
        }
        return this.server.address();
    }
    get port() {
        if (!this.server) {
            throw Error_1.ERROR_FACTORY.create("ServerManager", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
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
exports.ServerManager = ServerManager;
class Server extends App_1.App {
    settings;
    isServer = true;
    serverSupported = false;
    constructor(settings) {
        super(settings, false);
        this.settings = settings;
        this.initialize();
    }
    get server() {
        throw Error_1.ERROR_FACTORY.create("Server", "server-not-supported" /* Errors.SERVER_NOT_SUPPORTED */);
    }
    initialize() {
        super.initialize();
    }
    createServer(server, app) {
        throw Error_1.ERROR_FACTORY.create("Server", "server-not-supported" /* Errors.SERVER_NOT_SUPPORTED */);
    }
}
exports.Server = Server;
//# sourceMappingURL=browser.js.map