import { App } from "./App";
export class Server extends App {
    settings;
    isServer = true;
    constructor(settings) {
        super(settings, false);
        this.settings = settings;
        this.initialize();
    }
    initialize() {
        super.initialize();
    }
}
//# sourceMappingURL=Server.js.map