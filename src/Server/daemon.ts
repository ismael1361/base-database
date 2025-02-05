import fs from "fs";
import path from "path";

export class Daemon {
	constructor(readonly host: string, readonly port: number, readonly rootDir: string) {}

	log(message: string, type: "info" | "warn" | "error" = "info") {
		fs.appendFileSync(path.resolve(this.rootDir, "stacks.log"), `time=${new Date().toISOString()} level=${type.toUpperCase()} message=${JSON.stringify(message)}\n`);
	}
}
