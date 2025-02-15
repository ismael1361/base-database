import { AppSettings, App } from "../App/App";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
import type { Application } from "express";
import BasicEventEmitter from "basic-event-emitter";
import type { ListenOptions } from "net";
import type { Server as ServerIO } from "socket.io";
import { ERROR_FACTORY, Errors } from "../Error";

export const serverSupported = false;

export type HttpServerFunction = (app: Application) => HttpServer | HttpsServer;

export interface ServerSettings extends AppSettings {
	readonly name?: PropertyKey;
}

export abstract class ServerManager extends BasicEventEmitter<{}> {
	private server: HttpServer | undefined;
	private app: Application | undefined;
	private io: ServerIO | undefined;

	constructor() {
		super();
	}

	async initialize(server: HttpServer, app: Application, io: ServerIO): Promise<void> {
		this.server = server;
		this.app = app;
		this.io = io;

		this.setupMiddleware(this.app);
		this.setupRoutes(this.app);

		// this.io.on('connection', (socket) => {
		//     console.log('Um script conectou-se ao servidor via WebSocket:', socket.id);

		//     // Receber mensagens do script (projeto1.js)
		//     socket.on('registerRoute', (data) => {
		//         const { path, handler } = data;

		//         // Registrar a rota dinamicamente no Express
		//         this.app?.get(path, (req, res) => {
		//             handler(req, res);
		//         });

		//         console.log(`Rota registrada: ${path}`);
		//     });
		// });

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

	async listen(port?: number, hostname?: string, listeningListener?: () => void): Promise<this>;
	async listen(port?: number, listeningListener?: () => void): Promise<this>;
	async listen(path: string, listeningListener?: () => void): Promise<this>;
	async listen(options: ListenOptions, listeningListener?: () => void): Promise<this>;
	async listen(...args: [option1?: number | string | ListenOptions, option2?: string | (() => void), option3?: () => void]): Promise<this> {
		await this.ready(() => {
			return new Promise<void>((resolve) => {
				this.server?.once("listening", () => {
					resolve();
				});
				this.server?.listen.apply(this.server, args as any);
			});
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
