type ScriptCallback = { name: string; args: any[] };

type ScriptLine = (
	| {
			type: "line";
	  }
	| {
			type: "const" | "let" | "var";
			variable: string;
	  }
) & {
	isAsync?: boolean;
	content: ScriptCallback[];
	sql: {
		type: "create" | "select" | "insert" | "update" | "delete";
		props: Record<string, any>;
	};
};

export class ScriptsHelper {
	private scripts: ScriptLine[] = [];
	private events: Map<string, Function[]> = new Map();

	constructor() {}

	onScript(callback: (scripts: ScriptLine[]) => void) {
		const events = this.events.get("script") ?? [];
		events.push(callback);
		this.events.set("script", events);
		const self = this;
		return {
			stop() {
				self.events.set(
					"script",
					(self.events.get("script") ?? []).filter((v) => v !== callback),
				);
			},
		};
	}

	private emitScript(scripts: ScriptLine[]) {
		(this.events.get("script") ?? []).forEach((callback) => {
			callback(scripts);
		});
	}

	static renderScript(script: ScriptLine, others: ScriptLine[] = [], includeInitial = true) {
		let result = includeInitial ? "(async () => {\n" : "";
		let lines: string[] = [];
		const tab = includeInitial ? "\t" : "";

		if (includeInitial) result += tab + `try{\n` + tab + `\t`;

		if (script.content.length > 0) {
			let line =
				script.content
					.map((callback) => {
						return `${callback.name}(${callback.args
							.map((v) => {
								return JSON.stringify(v);
							})
							.join(", ")})`;
					})
					.join(".") + ";";

			switch (script.type) {
				case "const":
				case "let":
				case "var":
					line = `${script.type} ${script.variable} = ` + (script.isAsync ? "await " : "") + line;
					lines.push(line);
					lines.push(`resolve(${script.variable});`);
					break;
				default:
					line = (script.isAsync ? "await " : "") + line;
					lines.push(line);
					lines.push(`resolve();`);
					break;
			}
		}

		others.forEach((script) => {
			const l = this.renderScript(script, [], false);

			lines = [...lines.slice(0, -1), ...l.split("\n\t")];
		});

		result += lines
			.filter((l, i, self) => {
				if (i === 0) return true;
				return self[i - 1].trim() != l.trim();
			})
			.join(`\n${tab}\t`);

		if (includeInitial) result += "\n" + tab + `}catch(e){\n` + tab + `\treject(e);\n` + tab + `}`;

		if (includeInitial) result += "\n})();";

		return result;
	}

	get isInitialized() {
		return this.scripts.length > 0;
	}

	initialize(tableName: string) {
		this.scripts.push({
			type: "const",
			variable: "table",
			content: [{ name: "db.table", args: [tableName] }],
			sql: {
				type: "create",
				props: {},
			},
		});
		this.emitScript([this.scripts[this.scripts.length - 1]]);
	}

	get initialScript() {
		return this.scripts[0];
	}

	clear() {
		this.scripts = [];
	}

	push(...items: ScriptLine[]) {
		if (!this.isInitialized) return 0;
		const r = this.scripts.push(...items);
		this.emitScript(items);
		return r;
	}

	log() {
		return this.scripts.map((s) => ScriptsHelper.renderScript(s));
	}
}
