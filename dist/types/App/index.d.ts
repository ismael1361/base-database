import { App, AppSettings } from "./App";
export { DEFAULT_ENTRY_NAME } from "./internal";
export declare const initializeApp: (options?: AppSettings) => App;
export declare const appExists: (name?: string) => boolean;
export declare const getApp: (name?: string) => App;
export declare const getApps: () => App[];
export declare const getFirstApp: () => App;
export declare const deleteApp: (app: App) => void;
//# sourceMappingURL=index.d.ts.map