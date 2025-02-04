"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApp = exports.getFirstApp = exports.getApps = exports.getApp = exports.appExists = exports.initializeApp = exports.DEFAULT_ENTRY_NAME = void 0;
const Error_1 = require("../Error");
const Utils_1 = require("../Utils");
const App_1 = require("./App");
const internal_1 = require("./internal");
var internal_2 = require("./internal");
Object.defineProperty(exports, "DEFAULT_ENTRY_NAME", { enumerable: true, get: function () { return internal_2.DEFAULT_ENTRY_NAME; } });
function appendNewApp(app) {
    const existingApp = internal_1._apps.get(app.name);
    if (existingApp) {
        if ((0, Utils_1.deepEqual)(app.settings, existingApp.settings)) {
            return existingApp;
        }
        else {
            throw Error_1.ERROR_FACTORY.create("App", "duplicate-app" /* Errors.DUPLICATE_APP */, { appName: app.name });
        }
    }
    internal_1._apps.set(app.name, app);
    app.initialize();
    return app;
}
const initializeApp = (options = {}) => {
    const newApp = new App_1.App(options);
    return appendNewApp(newApp);
};
exports.initializeApp = initializeApp;
const appExists = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    return typeof name === "string" && internal_1._apps.has(name);
};
exports.appExists = appExists;
const getApp = (name = internal_1.DEFAULT_ENTRY_NAME) => {
    const app = internal_1._apps.get(name);
    if (!app) {
        throw Error_1.ERROR_FACTORY.create("getApp", "no-app" /* Errors.NO_APP */, { appName: name });
    }
    return app;
};
exports.getApp = getApp;
const getApps = () => {
    return Array.from(internal_1._apps.values());
};
exports.getApps = getApps;
const getFirstApp = () => {
    let app;
    if (internal_1._apps.has(internal_1.DEFAULT_ENTRY_NAME)) {
        app = internal_1._apps.get(internal_1.DEFAULT_ENTRY_NAME);
    }
    app = !app ? (0, exports.getApps)()[0] : app;
    if (!app) {
        throw Error_1.ERROR_FACTORY.create("getFirstApp", "no-app" /* Errors.NO_APP */, { appName: internal_1.DEFAULT_ENTRY_NAME });
    }
    return app;
};
exports.getFirstApp = getFirstApp;
const deleteApp = (app) => {
    const name = app.name;
    if (internal_1._apps.has(name)) {
        internal_1._apps.delete(name);
        app.isDeleted = true;
    }
};
exports.deleteApp = deleteApp;
//# sourceMappingURL=index.js.map