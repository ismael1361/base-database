"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const App_1 = require("./App");
class Server extends App_1.App {
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
exports.Server = Server;
//# sourceMappingURL=Server.js.map