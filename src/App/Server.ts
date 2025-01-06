import { AppSettings, App } from "./App";
import { DEFAULT_ENTRY_NAME } from "./internal";

export interface ServerSettings extends AppSettings {
	readonly name?: string;
}

export class Server extends App {
	readonly isServer: boolean = true;

	constructor(readonly settings: ServerSettings) {
		super(settings, false);
		this.initialize();
	}

	initialize() {
		super.initialize();
	}
}
