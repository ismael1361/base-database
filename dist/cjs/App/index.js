"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServer = exports.deleteApp = exports.getFirstServer = exports.getFirstApp = exports.getServers = exports.getApps = exports.getServer = exports.getApp = exports.serverExists = exports.appExists = exports.initializeServerApp = exports.initializeApp = void 0;
const Error_1 = require("../Error");
const Utils_1 = require("../Utils");
const App_1 = require("./App");
const internal_1 = require("./internal");
const Server_1 = require("./Server");
function appendNewApp(app) {
    const existingApp = (app.isServer ? internal_1._servers : internal_1._apps).get(app.name);
    if (existingApp) {
        if ((0, Utils_1.deepEqual)(app.settings, existingApp.settings)) {
            return existingApp;
        }
        else {
            throw Error_1.ERROR_FACTORY.create("duplicate-app" /* Errors.DUPLICATE_APP */, { appName: app.name });
        }
    }
    (app.isServer ? internal_1._servers : internal_1._apps).set(app.name, app);
    app.initialize();
    return app;
}
const initializeApp = (options = {}) => {
    const newApp = new App_1.App(options);
    return appendNewApp(newApp);
};
exports.initializeApp = initializeApp;
const initializeServerApp = (options = {}) => {
    const newApp = new Server_1.Server(options);
    return appendNewApp(newApp);
};
exports.initializeServerApp = initializeServerApp;
const appExists = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && internal_1._apps.has(name);
};
exports.appExists = appExists;
const serverExists = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && internal_1._servers.has(name);
};
exports.serverExists = serverExists;
const getApp = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    const app = internal_1._apps.get(name);
    if (!app) {
        throw Error_1.ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: name });
    }
    return app;
};
exports.getApp = getApp;
const getServer = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    const server = internal_1._servers.get(name);
    if (!server) {
        throw Error_1.ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: name });
    }
    return server;
};
exports.getServer = getServer;
const getApps = () => {
    return Array.from(internal_1._apps.values());
};
exports.getApps = getApps;
const getServers = () => {
    return Array.from(internal_1._servers.values());
};
exports.getServers = getServers;
const getFirstApp = () => {
    let app;
    if (internal_1._apps.has(internal_1.DEFAULT_ENTRY_NAME)) {
        app = internal_1._apps.get(internal_1.DEFAULT_ENTRY_NAME);
    }
    app = !app ? (0, exports.getApps)()[0] : app;
    if (!app) {
        throw Error_1.ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: internal_1.DEFAULT_ENTRY_NAME });
    }
    return app;
};
exports.getFirstApp = getFirstApp;
const getFirstServer = () => {
    let server;
    if (internal_1._servers.has(internal_1.DEFAULT_ENTRY_NAME)) {
        server = internal_1._servers.get(internal_1.DEFAULT_ENTRY_NAME);
    }
    server = !server ? (0, exports.getServers)()[0] : server;
    if (!server) {
        throw Error_1.ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: internal_1.DEFAULT_ENTRY_NAME });
    }
    return server;
};
exports.getFirstServer = getFirstServer;
const deleteApp = (app) => {
    const name = app.name;
    if (internal_1._apps.has(name)) {
        internal_1._apps.delete(name);
        app.isDeleted = true;
    }
};
exports.deleteApp = deleteApp;
const deleteServer = (server) => {
    const name = server.name;
    if (internal_1._servers.has(name)) {
        internal_1._servers.delete(name);
        server.isDeleted = true;
    }
};
exports.deleteServer = deleteServer;
//# sourceMappingURL=index.js.map