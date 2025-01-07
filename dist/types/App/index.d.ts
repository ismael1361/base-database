import { AppSettings, App } from "./App";
import { Server, ServerSettings } from "./Server";
export declare const initializeApp: (options?: AppSettings) => App;
export declare const initializeServerApp: (options?: ServerSettings) => Server;
export declare const appExists: (name?: string) => boolean;
export declare const serverExists: (name?: string) => boolean;
export declare const getApp: (name?: string) => App;
export declare const getServer: (name?: string) => Server;
export declare const getApps: () => App[];
export declare const getServers: () => Server[];
export declare const getFirstApp: () => App;
export declare const getFirstServer: () => Server;
export declare const deleteApp: (app: App) => void;
export declare const deleteServer: (server: Server) => void;
//# sourceMappingURL=index.d.ts.map