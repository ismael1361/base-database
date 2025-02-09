import { Errors, ERROR_FACTORY } from "../Error";
import { deepEqual } from "../Utils";
import { App, AppSettings } from "./App";
import { _apps, DEFAULT_ENTRY_NAME } from "./internal";

export { DEFAULT_ENTRY_NAME } from "./internal";

function appendNewApp<T extends App>(app: T): T {
	const existingApp = _apps.get(app.name);
	if (existingApp) {
		if (deepEqual(app.settings, existingApp.settings)) {
			return existingApp as T;
		} else {
			throw ERROR_FACTORY.create("App", Errors.DUPLICATE_APP, { appName: app.name });
		}
	}

	_apps.set(app.name, app as any);

	app.initialize();

	return app;
}

export const initializeApp = (options: AppSettings = {}): App => {
	const newApp = new App(options);
	return appendNewApp(newApp);
};

export const appExists = (name: PropertyKey = DEFAULT_ENTRY_NAME): boolean => {
	return typeof name === "string" && _apps.has(name);
};

export const getApp = (name: PropertyKey = DEFAULT_ENTRY_NAME): App => {
	const app = _apps.get(name);
	if (!app) {
		throw ERROR_FACTORY.create("getApp", Errors.NO_APP, { appName: name });
	}
	return app;
};

export const getApps = (): App[] => {
	return Array.from(_apps.values());
};

export const getFirstApp = (): App => {
	let app: App | undefined;
	if (_apps.has(DEFAULT_ENTRY_NAME)) {
		app = _apps.get(DEFAULT_ENTRY_NAME);
	}
	app = !app ? getApps()[0] : app;
	if (!app) {
		throw ERROR_FACTORY.create("getFirstApp", Errors.NO_APP, { appName: DEFAULT_ENTRY_NAME });
	}
	return app;
};

export const deleteApp = (app: App): void => {
	const name = app.name;
	if (_apps.has(name)) {
		_apps.delete(name);
		app.isDeleted = true;
	}
};
