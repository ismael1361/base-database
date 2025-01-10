import { AppSettings, App } from "../App";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
import type { Application } from "express";
import BasicEventEmitter from "basic-event-emitter";
import type { ListenOptions } from "net";
import { ERROR_FACTORY, Errors } from "../../Error";

export const serverSupported = false;

export type HttpServerFunction = (app: Application) => HttpServer | HttpsServer;

export interface ServerSettings extends AppSettings {
	readonly name?: string;
}

export abstract class ServerManager extends BasicEventEmitter<{}> {
	private server: HttpServer | undefined;
	private app: Application | undefined;

	constructor() {
		super();
	}

	async initialize(server: HttpServer, app: Application): Promise<void> {
		this.server = server;
		this.app = app;

		this.setupMiddleware(this.app);
		this.setupRoutes(this.app);

		this.prepared = true;
	}

	get host(): string {
		if (!this.server) {
			throw ERROR_FACTORY.create("ServerManager", Errors.SERVER_NOT_INITIALIZED);
		}
		return this.server.address() as any;
	}

	get port(): number {
		if (!this.server) {
			throw ERROR_FACTORY.create("ServerManager", Errors.SERVER_NOT_INITIALIZED);
		}
		return this.server.address() as any;
	}

	abstract setupMiddleware(app: Application): void;
	abstract setupRoutes(app: Application): void;

	listen(port?: number, hostname?: string, listeningListener?: () => void): this;
	listen(port?: number, listeningListener?: () => void): this;
	listen(path: string, listeningListener?: () => void): this;
	listen(options: ListenOptions, listeningListener?: () => void): this;
	listen(...args: [option1?: number | string | ListenOptions, option2?: string | (() => void), option3?: () => void]): this {
		this.ready(() => {
			this.server?.listen.apply(this.server, args as any);
		});
		return this;
	}
}

export class Server extends App {
	readonly isServer: boolean = true;
	readonly serverSupported: boolean = false;

	constructor(readonly settings: ServerSettings) {
		super(settings, false);
		this.initialize();
	}

	get server(): ServerManager {
		throw ERROR_FACTORY.create("Server", Errors.SERVER_NOT_SUPPORTED);
	}

	initialize() {
		super.initialize();
	}

	createServer(server: HttpServerFunction): ServerManager;
	createServer(server: HttpServerFunction, app: Application): ServerManager;
	createServer(app: Application): ServerManager;
	createServer(): ServerManager;
	createServer(server?: HttpServerFunction | Application, app?: Application): ServerManager {
		throw ERROR_FACTORY.create("Server", Errors.SERVER_NOT_SUPPORTED);
	}
}
