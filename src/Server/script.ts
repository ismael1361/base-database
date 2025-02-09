import type { Server } from "./index";

export class Script {
	constructor(readonly app: Server) {}

	async restart() {}
}
