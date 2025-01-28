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

type ScriptDispatch = Script & { executed: boolean; execute: () => void };

export class ScriptsHelper {
	private scripts: ScriptDispatch[] = [];
	private events: Map<string, Function[]> = new Map();
	private _tableName: string = "";

	constructor() {}

	get tableName() {
		return this._tableName;
	}

	on(event: "script", callback: (table: string, scripts: ScriptDispatch[]) => void): { stop(): void };
	on(event: string, callback: Function): { stop(): void } {
		const events = this.events.get(event) ?? [];
		events.push(callback);
		this.events.set(event, events);
		const self = this;
		return {
			stop() {
				self.off(event as any, callback as any);
			},
		};
	}

	off(event: "script", callback: (table: string, scripts: ScriptDispatch[]) => void): void;
	off(event: string, callback: Function): void {
		this.events.set(
			event,
			(this.events.get(event) ?? []).filter((v) => v !== callback),
		);
	}

	emit(event: "script", table: string, scripts: ScriptDispatch[]): void;
	emit(event: string, ...args: any[]): void {
		(this.events.get(event) ?? []).forEach((callback) => {
			callback(...args);
		});
	}

	private emitScript(scripts: Script[]) {
		const list = scripts.map((script): ScriptDispatch => ({ ...script, executed: false, execute() {} }));
		const r = this.scripts.push(...list);
		this.emit("script", this.tableName, list);
		return r;
	}

	get isInitialized() {
		return this.scripts.length > 0;
	}

	get isEmpty() {
		return this.scripts.length === 0;
	}

	get isLoading() {
		return this.scripts.some((script) => !script.executed);
	}

	select(table: string, columns: string[] = []) {
		this._tableName = table;
		this.emitScript([
			{
				type: "select",
				table,
				columns,
			},
		]);
	}

	clear() {
		this.scripts = [];
	}

	push(...items: Script[]) {
		return this.emitScript(items);
	}
}
