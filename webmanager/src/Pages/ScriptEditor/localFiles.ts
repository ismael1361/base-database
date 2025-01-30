import { _apps } from "./../../../../src/App/internal";
import { Files } from "./FilesTree";

export type LocalFiles = Record<string, Omit<Files[number], "path"> & { source: string }>;

export const localFiles: LocalFiles = {};

localFiles["file:///src/Routers/dashboard.ts"] = {
	createDate: new Date(),
	modifiedDate: new Date(),
	source: /*ts*/ `import { Router } from "utils";

export default Router([], (router)=>{
    router.get("/", [], (req)=>{
        
    });
});`,
};

localFiles["file:///src/Routers/index.ts"] = {
	createDate: new Date(),
	modifiedDate: new Date(),
	source: /*ts*/ `import { Router } from "utils";
import { Auth, Wallet } from "Middlewares";

export default Router([Auth.middleware, Wallet.middleware], (router)=>{
    router.get("/", [], (req)=>{
        const { user, wallet } = req;
    });
});`,
};

localFiles["file:///src/Routers/users.ts"] = {
	createDate: new Date(),
	modifiedDate: new Date(),
	source: /*ts*/ `import { Router } from "utils";

export default Router([], (router)=>{
    router.get("/", [], (req)=>{

    });
});`,
};

localFiles["file:///src/Middlewares/index.ts"] = {
	createDate: new Date(),
	modifiedDate: new Date(),
	source: /*ts*/ `import { Request, MiddlewaresBase, Middleware } from "utils";

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
    middleware(req, res, next){}
};

interface WalletRequest extends AuthRequest {
    wallet: {
        uid: string;
        address: string;
        walletAddress: string;
        privateKey: string;
    };
}

export const Wallet:MiddlewaresBase<{
    middleware: Middleware<WalletRequest>;
}> = {
    middleware(req, res, next){}
};`,
};

localFiles["file:///src/Scripts/index.ts"] = {
	createDate: new Date(),
	modifiedDate: new Date(),
	source: /*ts*/ `export const promiseIsPending = async <T = any>(p: Promise<T>): Promise<boolean> => {
    const PENDING = Symbol.for("PENDING");
    const result = await Promise.race([p, Promise.resolve(PENDING)]);
    return result === PENDING;
};`,
};
