import { ERROR_FACTORY } from "../Error";
import { deepEqual } from "../Utils";
import { App } from "./App";
import { _apps, _servers, DEFAULT_ENTRY_NAME } from "./internal";
import { Server } from "./Server";
function appendNewApp(app) {
    const existingApp = (app.isServer ? _servers : _apps).get(app.name);
    if (existingApp) {
        if (deepEqual(app.settings, existingApp.settings)) {
            return existingApp;
        }
        else {
            throw ERROR_FACTORY.create("duplicate-app" /* Errors.DUPLICATE_APP */, { appName: app.name });
        }
    }
    (app.isServer ? _servers : _apps).set(app.name, app);
    app.initialize();
    return app;
}
export const initializeApp = (options = {}) => {
    const newApp = new App(options);
    return appendNewApp(newApp);
};
export const initializeServerApp = (options = {}) => {
    const newApp = new Server(options);
    return appendNewApp(newApp);
};
export const appExists = (name = DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && _apps.has(name);
};
export const serverExists = (name = DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && _servers.has(name);
};
export const getApp = (name = DEFAULT_ENTRY_NAME) => {
    const app = _apps.get(name);
    if (!app) {
        throw ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: name });
    }
    return app;
};
export const getServer = (name = DEFAULT_ENTRY_NAME) => {
    const server = _servers.get(name);
    if (!server) {
        throw ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: name });
    }
    return server;
};
export const getApps = () => {
    return Array.from(_apps.values());
};
export const getServers = () => {
    return Array.from(_servers.values());
};
export const getFirstApp = () => {
    let app;
    if (_apps.has(DEFAULT_ENTRY_NAME)) {
        app = _apps.get(DEFAULT_ENTRY_NAME);
    }
    app = !app ? getApps()[0] : app;
    if (!app) {
        throw ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: DEFAULT_ENTRY_NAME });
    }
    return app;
};
export const getFirstServer = () => {
    let server;
    if (_servers.has(DEFAULT_ENTRY_NAME)) {
        server = _servers.get(DEFAULT_ENTRY_NAME);
    }
    server = !server ? getServers()[0] : server;
    if (!server) {
        throw ERROR_FACTORY.create("no-app" /* Errors.NO_APP */, { appName: DEFAULT_ENTRY_NAME });
    }
    return server;
};
export const deleteApp = (app) => {
    const name = app.name;
    if (_apps.has(name)) {
        _apps.delete(name);
        app.isDeleted = true;
    }
};
export const deleteServer = (server) => {
    const name = server.name;
    if (_servers.has(name)) {
        _servers.delete(name);
        server.isDeleted = true;
    }
};
//# sourceMappingURL=index.js.map