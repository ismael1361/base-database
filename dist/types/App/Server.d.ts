import { AppSettings, App } from "./App";
export interface ServerSettings extends AppSettings {
    readonly name?: string;
}
export declare class Server extends App {
    readonly settings: ServerSettings;
    readonly isServer: boolean;
    constructor(settings: ServerSettings);
    initialize(): void;
}
//# sourceMappingURL=Server.d.ts.map