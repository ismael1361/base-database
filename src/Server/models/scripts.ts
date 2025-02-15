import path from "path";
import fs from "fs";

const verifyExistsFile = (filePath: string, content: string) => {
	const dirPath = path.dirname(filePath);

	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content);
	}
};

export const default_scripts = (rootPath: string) => {
	verifyExistsFile(
		path.resolve(rootPath, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					lib: ["ESNext", "ES2015"],
					target: "ESNext",
					moduleResolution: "node",
					listEmittedFiles: false,
					allowJs: true,
					checkJs: false,
					noFallthroughCasesInSwitch: true,
					noEmitOnError: true,
					strict: true,
					noImplicitAny: false,
					skipLibCheck: true,
					esModuleInterop: true,
					pretty: true,
					allowSyntheticDefaultImports: true,
					alwaysStrict: true,
					resolveJsonModule: true,
					rootDir: "./src",
					declaration: true,
					declarationDir: "./types",
				},
			},
			null,
			4,
		),
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "utils/HandleError.ts"),
		`export class HandleError extends Error {
    constructor(readonly message: string, readonly name: string = "DEFAULT", readonly cause?: any) {
        super(message);
    }
}`,
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "utils/Router.ts"),
		`import { HandleError } from "./HandleError";

import type { Request, Response, NextFunction, Router as ExpressRouter } from "express";
import Express from "express";

export { Request, Response, NextFunction };

/**
 * The middleware function that will be called when a route is matched.
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 * @example
 * \`\`\`ts
 * import { Middleware } from "router";
 *
 * const middleware: Middleware = (req, res, next) => {
 *    res.send("Hello, World!");
 * };
 * \`\`\`
 */
export type Middleware<Req extends Request = Request, Res extends Response = Response> = (req: Req, res: Res, next: NextFunction) => void;

export type MiddlewaresBase<T extends Record<PropertyKey, Middleware<any, any>>> = {
    [K in keyof T]: T[K];
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type MiddlewareRequestType<T> = T extends Middleware<infer Req, any> ? (Req extends Request ? Req : never) : never;

type CombinedRequest<Mw extends Middleware<any, any>[]> = UnionToIntersection<MiddlewareRequestType<Mw[number]>> extends infer Result ? (Result extends never ? Request : Result & Request) : never;

type HandlerType<Mw extends Middleware<any, any>[], Res extends Response> = Middleware<CombinedRequest<Mw>, Res> | InRouter<Res, Mw>;

/**
 * The router instance that will be returned from the \`Router\` function.
 * @template Res The response type.
 * @template C The middlewares that will be applied to all routes.
 * @example
 *
 * \`\`\`ts
 * import { Router } from "utils";
 *
 * export default Router((router) => {
 *    router.get("/", [], (req: Request, res: Response) => {
 *        res.send("Hello, World!");
 *    });
 * });
 * \`\`\`
 */
interface InRouter<Res extends Response, C extends Middleware<any, any>[]> extends Omit<ExpressRouter, "get" | "post" | "put" | "delete" | "patch" | "options" | "head" | "use"> {
    /**
     * Registers a GET route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.get("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    get(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a GET route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.get("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    get<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a POST route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.post("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    post(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a POST route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.post("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    post<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a PUT route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.put("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    put(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a PUT route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.put("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    put<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a DELETE route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.delete("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    delete(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a DELETE route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.delete("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    delete<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a PATCH route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.patch("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    patch(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a PATCH route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.patch("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    patch<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers an OPTIONS route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.options("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    options(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers an OPTIONS route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.options("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    options<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a HEAD route.
     * @param path The path of the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.head("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    head(path: string, handler: HandlerType<[...C], Res>): any;

    /**
     * Registers a HEAD route.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handler The handler function that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.head("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    head<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], handler: HandlerType<[...Mw, ...C], Res>): any;

    /**
     * Registers a middleware.
     * @param path The path of the route.
     * @param handlers The handler functions that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.use("/", (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    use(path: string, ...handlers: HandlerType<[...C], Res>[]): any;

    /**
     * Registers a middleware.
     * @param path The path of the route.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handlers The handler functions that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.use("/", [], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    use<Mw extends Middleware<any, any>[]>(path: string, middlewares: [...Mw], ...handlers: HandlerType<[...Mw, ...C], Res>[]): any;

    /**
     * Registers a middleware.
     * @param handlers The handler functions that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.use((req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    use(...handlers: HandlerType<[...C], Res>[]): any;

    /**
     * Registers a middleware.
     * @param middlewares The middlewares that will be applied to the route.
     * @param handlers The handler functions that will be called when the route is matched.
     * @example
     * \`\`\`ts
     * router.use([], (req, res) => {
     *    res.send("Hello, World!");
     * });
     * \`\`\`
     */
    use<Mw extends Middleware<any, any>[]>(middlewares: [...Mw], ...handlers: HandlerType<[...Mw, ...C], Res>[]): any;
}

export type Handler<Req extends Request = Request, Res extends Response = Response> = (req: Req, res: Res, next: NextFunction) => void;

const tryHandler = <Mw extends Middleware<any, any>[]>(handler: HandlerType<Mw, any>) =>
    typeof handler === "function"
        ? async (req: Request, res: Response, next: NextFunction) => {
              try {
                  await new Promise((resolve) => setTimeout(resolve, 0));
                  const response: any = handler(req as any, res, next);
                  if (response instanceof Promise) await response;
              } catch (error) {
                  console.error(error);
                  const code: number = error instanceof HandleError && typeof error.cause === "number" ? error.cause : 400;
                  const message = error instanceof HandleError || error instanceof Error ? error.message : "Bad Request";
                  res.status(code).json({ message });
              }
          }
        : (handler as any);

type RouterCallback<Mw extends Middleware<any, any>[], Res extends Response = Response> = (router: InRouter<Res, Mw>) => void;

/**
 * Provides a way to create a router with.
 * @param callback The callback function that will be called with the router instance.
 * @returns The router instance.
 * @example
 * \`\`\`ts
 * import { Router } from "utils";
 *
 * export default Router((router) => {
 *    router.get("/", [], (req, res) => {
 *        res.send("Hello, World!");
 *    });
 * });
 * \`\`\`
 */
export function Router<Mw extends Middleware<any, any>[], Res extends Response = Response>(callback: RouterCallback<Mw, Res>): ExpressRouter;

/**
 * Provides a way to create a router with middleware support.
 * @param middlewares The middlewares that will be applied to all routes.
 * @param callback The callback function that will be called with the router instance.
 * @returns The router instance.
 * @example
 * \`\`\`ts
 * import { Router } from "utils";
 *
 * export default Router([], (router) => {
 *    router.get("/", [], (req, res) => {
 *        res.send("Hello, World!");
 *    });
 * });
 * \`\`\`
 */
export function Router<Mw extends Middleware<any, any>[], Res extends Response = Response>(middlewares: [...Mw], callback: RouterCallback<Mw, Res>): ExpressRouter;

export function Router<Mw extends Middleware<any, any>[], Res extends Response = Response>(middlewares: [...Mw] | RouterCallback<Mw, Res>, callback?: RouterCallback<Mw, Res>): ExpressRouter {
    const expressRouter = Express.Router();
    if (Array.isArray(middlewares) && middlewares.length > 0) {
        for (const middleware of middlewares) {
            expressRouter.use(typeof middleware === "function" ? tryHandler(middleware) : middleware);
        }
    }

    callback = typeof middlewares === "function" ? middlewares : callback!;

    const typedRouter: InRouter<Res, Mw> = {
        ...(expressRouter as any),
        get(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.get(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        post(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.post(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        put(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.put(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        delete(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.delete(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        patch(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.patch(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        options(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.options(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        head(path, middlewares, handler) {
            handler = typeof middlewares === "function" ? middlewares : handler;
            middlewares = typeof middlewares === "function" ? ([] as any) : middlewares;
            expressRouter.head(path, ...middlewares.map(tryHandler), tryHandler(handler));
            return typedRouter;
        },
        use(path: any, middlewares: any[], ...handlers: any[]) {
            middlewares = typeof path === "function" ? ([middlewares] as any) : middlewares;
            expressRouter.use(typeof path === "function" ? tryHandler(path) : path, ...middlewares.map(tryHandler), ...handlers.map(tryHandler));
            return typedRouter;
        },
    };

    callback(typedRouter);
    return expressRouter;
}`,
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "utils/index.ts"),
		`export * from "./HandleError";
export * from "./Router";

export const promiseIsPending = async <T = any>(p: Promise<T>): Promise<boolean> => {
    const PENDING = Symbol.for("PENDING");
    const result = await Promise.race([p, Promise.resolve(PENDING)]);
    return result === PENDING;
};

export const uuidv4 = (separator: string = "") => {
    let currentTime = Date.now();
    return \`xxxxxxxx$\{separator\}xxxx$\{separator\}4xxx$\{separator\}yxxx$\{separator\}xxxxxxxxxxxx\`.replace(/[xy]/g, function (c) {
        const r = (currentTime + Math.random() * 16) % 16 | 0;
        currentTime = Math.floor(currentTime / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
};`,
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "Routers/index.ts"),
		`import { Router } from "utils";
import { Auth } from "Middlewares";

export default Router([Auth.middleware], (router)=>{
    router.get("/", [], (req, res)=>{
        res.send("Hello, World!");
    });
});`,
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "Middlewares/index.ts"),
		`import { Request, MiddlewaresBase, Middleware } from "utils";

type UserAccessToken = {
    access_token: string;
    database: string;
    uid: string;
    created: number;
    ip: string;
};

interface AuthRequest extends Request {
    user: UserAccessToken;
}

export const Auth:MiddlewaresBase<{
    middleware: Middleware<AuthRequest>;
}> = {
    middleware(req, res, next){
        if(req.headers.authorization){
            const [type, token] = req.headers.authorization.split(" ");
            if(type === "Bearer"){
                req.user = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
            }
        }
        next();
    }
};`,
	);

	verifyExistsFile(
		path.resolve(rootPath, "src", "Scripts/index.ts"),
		`export const promiseIsPending = async <T = any>(p: Promise<T>): Promise<boolean> => {
    const PENDING = Symbol.for("PENDING");
    const result = await Promise.race([p, Promise.resolve(PENDING)]);
    return result === PENDING;
};`,
	);
};
