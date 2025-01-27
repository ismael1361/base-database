interface ScriptBase {
	type: "create" | "select" | "insert" | "update" | "delete";
}

interface ScriptCreate extends ScriptBase {
	type: "create";
	table: string;
}

interface ScriptSelect extends ScriptBase {
	type: "select";
	table: string;
	columns: string[];
}

interface ScriptInsert extends ScriptBase {
	type: "insert";
	rows: Array<Record<PropertyKey, any>>;
}

interface ScriptUpdate extends ScriptBase {
	type: "update";
	rows: Record<number, Record<PropertyKey, any>>;
}

interface ScriptDelete extends ScriptBase {
	type: "delete";
	rowid: number[];
}

type Script = ScriptSelect | ScriptCreate | ScriptInsert | ScriptUpdate | ScriptDelete;

export class ScriptsHelper {
	private scripts: Script[] = [];
	private events: Map<string, Function[]> = new Map();
	private _tableName: string = "";

	constructor() {}

	get tableName() {
		return this._tableName;
	}

	onScript(callback: (scripts: Script[]) => void) {
		const events = this.events.get("script") ?? [];
		events.push(callback);
		this.events.set("script", events);
		const self = this;
		return {
			stop() {
				self.offScript(callback);
			},
		};
	}

	offScript(callback: (scripts: Script[]) => void) {
		this.events.set(
			"script",
			(this.events.get("script") ?? []).filter((v) => v !== callback),
		);
	}

	private emitScript(scripts: Script[]) {
		(this.events.get("script") ?? []).forEach((callback) => {
			callback(scripts);
		});
	}

	get isInitialized() {
		return this.scripts.length > 0;
	}

	select(table: string, columns: string[] = []) {
		this._tableName = table;
		this.scripts.push({
			type: "select",
			table,
			columns,
		});
		this.emitScript([this.scripts[this.scripts.length - 1]]);
	}

	clear() {
		this.scripts = [];
	}

	push(...items: Script[]) {
		const r = this.scripts.push(...items);
		this.emitScript(items);
		return r;
	}
}
