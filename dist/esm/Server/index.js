import * as Browser from "./browser";
import { ERROR_FACTORY } from "../Error";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import express from "express";
import cors from "cors";
import { createRoutes } from "../Webmanager";
import { isInstanceOf } from "../Utils";
export const serverSupported = true;
export const instanceApplication = express.application;
const getCorsOptions = (allowedOrigins) => {
    return {
        origin: allowedOrigins === "*" ? true : allowedOrigins === "" ? false : allowedOrigins.split(/,\s*/),
        methods: "GET,PUT,POST,DELETE,OPTIONS",
        allowedHeaders: "Content-Type, Authorization, Content-Length, Accept, Origin, X-Requested-With",
    };
};
const getCorsHeaders = (allowedOrigins, currentOrigin) => {
    const corsOptions = getCorsOptions(allowedOrigins);
    const origins = typeof corsOptions.origin === "boolean" ? (corsOptions.origin ? currentOrigin ?? "*" : "") : corsOptions.origin instanceof Array ? corsOptions.origin.join(",") : corsOptions.origin;
    return {
        "Access-Control-Allow-Origin": origins,
        "Access-Control-Allow-Methods": corsOptions.methods,
        "Access-Control-Allow-Headers": corsOptions.allowedHeaders,
        "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    };
};
export class ServerManager extends Browser.ServerManager {
    allowOrigin;
    router = express.Router();
    constructor(http_server, app, allowOrigin = "*") {
        super();
        this.allowOrigin = allowOrigin;
        app = isInstanceOf(app, instanceApplication) ? app : express();
        const server = typeof http_server === "function" ? http_server(app) : new HttpServer(app);
        if (!isInstanceOf(server, HttpServer) && !isInstanceOf(server, HttpsServer)) {
            throw ERROR_FACTORY.create("ServerManager", "invalid-server-instance" /* Errors.INVALID_SERVER_INSTANCE */);
        }
        this.initialize(server, app);
    }
    setupMiddleware(app) {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use((req, res, next) => {
            const headers = getCorsHeaders(this.allowOrigin, req.headers.origin);
            for (const name in headers) {
                res.setHeader(name, headers[name]);
            }
            if (req.method === "OPTIONS") {
                return res.status(200).end();
            }
            next();
        });
        app.use(cors((req, callback) => {
            const headers = getCorsHeaders(this.allowOrigin, req.headers.origin);
            let corsOptions = { origin: false };
            const whitelist = headers["Access-Control-Allow-Origin"].split(/,\s*/);
            if (whitelist.includes(req.headers.origin ?? "") || whitelist.includes("*")) {
                corsOptions = { origin: true };
            }
            else {
                corsOptions = { origin: false };
            }
            callback(null, corsOptions);
        }));
    }
    setupRoutes(app) {
        app.use(this.router);
    }
}
export class Server extends Browser.Server {
    settings;
    serverSupported = true;
    _server;
    constructor(settings) {
        super(settings);
        this.settings = settings;
        this.initialize();
    }
    get server() {
        if (this._server === undefined) {
            throw ERROR_FACTORY.create("Server", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
        }
        return this._server;
    }
    initialize() {
        super.initialize();
    }
    createServer(server, app) {
        this._server = new ServerManager(isInstanceOf(server, instanceApplication) ? undefined : typeof server === "function" ? server : undefined, isInstanceOf(server, instanceApplication) ? server : app);
        createRoutes(this._server);
        return this._server;
    }
}
//# sourceMappingURL=index.js.map