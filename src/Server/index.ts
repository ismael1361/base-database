import * as Browser from "./browser";
import { ERROR_FACTORY, Errors } from "../Error";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import express, { Application } from "express";
import cors from "cors";
import { createRoutes } from "../Webmanager";
import { isInstanceOf } from "../Utils";

export { HttpServerFunction, ServerSettings } from "./browser";

export const serverSupported = true;

export const instanceApplication = express.application;

const getCorsOptions = (allowedOrigins: string) => {
	return {
		origin: allowedOrigins === "*" ? true : allowedOrigins === "" ? false : allowedOrigins.split(/,\s*/),
		methods: "GET,PUT,POST,DELETE,OPTIONS",
		allowedHeaders: "Content-Type, Authorization, Content-Length, Accept, Origin, X-Requested-With",
	};
};

const getCorsHeaders = (allowedOrigins: string, currentOrigin: string | undefined) => {
	const corsOptions = getCorsOptions(allowedOrigins);
	const origins =
		typeof corsOptions.origin === "boolean" ? (corsOptions.origin ? currentOrigin ?? "*" : "") : corsOptions.origin instanceof Array ? corsOptions.origin.join(",") : corsOptions.origin;
	return {
		"Access-Control-Allow-Origin": origins,
		"Access-Control-Allow-Methods": corsOptions.methods,
		"Access-Control-Allow-Headers": corsOptions.allowedHeaders,
		"Access-Control-Expose-Headers": "Content-Length, Content-Range",
	};
};

export class ServerManager extends Browser.ServerManager {
	readonly router: express.Router = express.Router();

	constructor(http_server?: Browser.HttpServerFunction, app?: Application, readonly allowOrigin: string = "*") {
		super();

		app = isInstanceOf(app, instanceApplication) ? app : express();
		const server: HttpServer | HttpsServer = typeof http_server === "function" ? http_server(app) : new HttpServer(app);

		if (!isInstanceOf(server, HttpServer) && !isInstanceOf(server, HttpsServer)) {
			throw ERROR_FACTORY.create("ServerManager", Errors.INVALID_SERVER_INSTANCE);
		}

		this.initialize(server, app);
	}

	setupMiddleware(app: Application): void {
		app.use(express.json());
		app.use(express.urlencoded({ extended: true }));

		app.use((req, res, next): any => {
			const headers: {
				[name: string]: string;
			} = getCorsHeaders(this.allowOrigin, req.headers.origin);
			for (const name in headers) {
				res.setHeader(name, headers[name]);
			}
			if (req.method === "OPTIONS") {
				return res.status(200).end();
			}
			next();
		});

		app.use(
			cors((req, callback) => {
				const headers: {
					[name: string]: string;
				} = getCorsHeaders(this.allowOrigin, req.headers.origin);

				let corsOptions = { origin: false };
				const whitelist = headers["Access-Control-Allow-Origin"].split(/,\s*/);

				if (whitelist.includes(req.headers.origin ?? "") || whitelist.includes("*")) {
					corsOptions = { origin: true };
				} else {
					corsOptions = { origin: false };
				}

				callback(null, corsOptions);
			}),
		);
	}

	setupRoutes(app: Application): void {
		app.use(this.router);
	}
}

export class Server extends Browser.Server {
	readonly serverSupported: boolean = true;
	private _server: ServerManager | undefined;

	constructor(readonly settings: Browser.ServerSettings) {
		super(settings);
		this.initialize();
	}

	get server(): ServerManager {
		if (this._server === undefined) {
			throw ERROR_FACTORY.create("Server", Errors.SERVER_NOT_INITIALIZED);
		}
		return this._server;
	}

	initialize() {
		super.initialize();
	}

	createServer(server: Browser.HttpServerFunction): ServerManager;
	createServer(server: Browser.HttpServerFunction, app: Application): ServerManager;
	createServer(app: Application): ServerManager;
	createServer(): ServerManager;
	createServer(server?: Browser.HttpServerFunction | Application, app?: Application): ServerManager {
		this._server = new ServerManager(
			isInstanceOf(server, instanceApplication) ? undefined : typeof server === "function" ? (server as any) : undefined,
			isInstanceOf(server, instanceApplication) ? (server as any) : app,
		);
		createRoutes(this._server);
		return this._server as any;
	}
}
