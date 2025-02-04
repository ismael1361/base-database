import { ERROR_FACTORY } from "../Error";
import { deepEqual } from "../Utils";
import { App } from "./App";
import { _apps, DEFAULT_ENTRY_NAME } from "./internal";
export { DEFAULT_ENTRY_NAME } from "./internal";
function appendNewApp(app) {
    const existingApp = _apps.get(app.name);
    if (existingApp) {
        if (deepEqual(app.settings, existingApp.settings)) {
            return existingApp;
        }
        else {
            throw ERROR_FACTORY.create("App", "duplicate-app" /* Errors.DUPLICATE_APP */, { appName: app.name });
        }
    }
    _apps.set(app.name, app);
    app.initialize();
    return app;
}
export const initializeApp = (options = {}) => {
    const newApp = new App(options);
    return appendNewApp(newApp);
};
export const appExists = (name = DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && _apps.has(name);
};
export const getApp = (name = DEFAULT_ENTRY_NAME) => {
    const app = _apps.get(name);
    if (!app) {
        throw ERROR_FACTORY.create("getApp", "no-app" /* Errors.NO_APP */, { appName: name });
    }
    return app;
};
export const getApps = () => {
    return Array.from(_apps.values());
};
export const getFirstApp = () => {
    let app;
    if (_apps.has(DEFAULT_ENTRY_NAME)) {
        app = _apps.get(DEFAULT_ENTRY_NAME);
    }
    app = !app ? getApps()[0] : app;
    if (!app) {
        throw ERROR_FACTORY.create("getFirstApp", "no-app" /* Errors.NO_APP */, { appName: DEFAULT_ENTRY_NAME });
    }
    return app;
};
export const deleteApp = (app) => {
    const name = app.name;
    if (_apps.has(name)) {
        _apps.delete(name);
        app.isDeleted = true;
    }
};
//# sourceMappingURL=index.js.map