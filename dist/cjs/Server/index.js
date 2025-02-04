"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.ServerManager = exports.instanceApplication = exports.serverSupported = void 0;
const Browser = __importStar(require("./browser"));
const Error_1 = require("../Error");
const http_1 = require("http");
const https_1 = require("https");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Webmanager_1 = require("../Webmanager");
const Utils_1 = require("../Utils");
exports.serverSupported = true;
exports.instanceApplication = express_1.default.application;
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
class ServerManager extends Browser.ServerManager {
    allowOrigin;
    router = express_1.default.Router();
    constructor(http_server, app, allowOrigin = "*") {
        super();
        this.allowOrigin = allowOrigin;
        app = (0, Utils_1.isInstanceOf)(app, exports.instanceApplication) ? app : (0, express_1.default)();
        const server = typeof http_server === "function" ? http_server(app) : new http_1.Server(app);
        if (!(0, Utils_1.isInstanceOf)(server, http_1.Server) && !(0, Utils_1.isInstanceOf)(server, https_1.Server)) {
            throw Error_1.ERROR_FACTORY.create("ServerManager", "invalid-server-instance" /* Errors.INVALID_SERVER_INSTANCE */);
        }
        this.initialize(server, app);
    }
    setupMiddleware(app) {
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
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
        app.use((0, cors_1.default)((req, callback) => {
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
exports.ServerManager = ServerManager;
class Server extends Browser.Server {
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
            throw Error_1.ERROR_FACTORY.create("Server", "server-not-initialized" /* Errors.SERVER_NOT_INITIALIZED */);
        }
        return this._server;
    }
    initialize() {
        super.initialize();
    }
    createServer(server, app) {
        this._server = new ServerManager((0, Utils_1.isInstanceOf)(server, exports.instanceApplication) ? undefined : typeof server === "function" ? server : undefined, (0, Utils_1.isInstanceOf)(server, exports.instanceApplication) ? server : app);
        (0, Webmanager_1.createRoutes)(this._server);
        return this._server;
    }
}
exports.Server = Server;
//# sourceMappingURL=index.js.map