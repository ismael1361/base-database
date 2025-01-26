import React from "react";
import styles from "./styles.module.scss";
import { useDebouncedCallback, useDebouncedEffect, useHistory } from "UseHooks";
import { GridHeader } from "./GridHeader";
import { Table } from "./TableComponents";
import { EntireRowsSelection, Selection } from "react-spreadsheet";
import { ScriptsHelper } from "Helpers";
import { Icon } from "Components";

interface DataRowsItem {
	value?: string | number | boolean | null;
	current?: string | number | boolean | null;
	removed?: boolean;
	readOnly?: boolean;
	style?: React.CSSProperties;
}

interface DataColumnsItem {
	key: string;
	info?: string;
	width?: number;
	align?: "left" | "center" | "right";
	style?: React.CSSProperties;
	type?: "string" | "integer" | "float" | "boolean" | "date" | "datetime";
	options?: Array<string>;
}

export interface Data {
	columns: Array<DataColumnsItem>;
	rows: Array<{
		columns: Record<PropertyKey, DataRowsItem>;
		rowid: string;
	}>;
}

export const DataContext = React.createContext<{
	data: Data;
	updateData(data: Data): void;
}>({
	data: {
		columns: [],
		rows: [],
	},
	updateData(data: Data) {},
});

const tableData: Data = {
	columns: [
		{ key: "flavour", info: "TEXT", width: 200, align: "center" },
		{ key: "food", info: "TEXT", width: 200, align: "center" },
		{ key: "none", info: "OPTION", width: 100, align: "center", options: ["auto", "default"] },
		{ key: "date", info: "DATETIME", width: 200, align: "center", type: "datetime" },
		{ key: "amount", info: "INTEGER", width: 100, align: "center", type: "integer" },
		{ key: "valido", info: "BOOLEAN", width: 100, align: "center", type: "boolean" },
	],
	rows: [
		{
			rowid: "1",
			columns: { flavour: { value: "Vanilla" }, food: { value: "Ice Cream" }, none: { value: "" }, date: { value: "2022-01-01T00:00" } },
		},
		{
			rowid: "2",
			columns: { flavour: { value: "Chocolate" }, food: { value: "Cake" }, none: { value: "" } },
		},
		{
			rowid: "5",
			columns: { flavour: { value: "Strawberry" }, food: { value: "Cookies" }, none: { value: "" } },
		},
		{
			rowid: "6",
			columns: { flavour: { value: "Mint" }, food: { value: "Ice Cream" }, none: { value: "" } },
		},
		{
			rowid: "9",
			columns: { flavour: { value: "Chocolate" }, food: { value: "Cake" }, none: { value: "" } },
		},
		{
			rowid: "10",
			columns: { flavour: { value: "Vanilla" }, food: { value: "Cookies" }, none: { value: "" } },
		},
		{
			rowid: "11",
			columns: { flavour: { value: "Strawberry" }, food: { value: "Ice Cream" }, none: { value: "" } },
		},
		{
			rowid: "15",
			columns: { flavour: { value: "Mint" }, food: { value: "Cake" }, none: { value: "" } },
		},
		{
			rowid: "16",
			columns: { flavour: { value: "Chocolate" }, food: { value: "Cookies" }, none: { value: "" } },
		},
		{
			rowid: "17",
			columns: { flavour: { value: "Vanilla" }, food: { value: "Ice Cream" }, none: { value: "" } },
		},
	],
};

const prepareData = (data: Data): Data => {
	const columns = data.columns.map((column) => {
		const { key, info, width, align, style, options, type } = column;
		return {
			key,
			info,
			width: width ?? 100,
			align: align ?? "left",
			style: style ?? {},
			options: options ?? [],
			type: type ?? "string",
		};
	});

	const normalizeCell = (cell?: DataRowsItem) => {
		const { value } = cell ?? {};
		return { value, ...(cell ?? {}), current: value, removed: false };
	};

	for (const rowId in data.rows) {
		columns.forEach(({ key }) => {
			if (!data.rows[rowId].columns) {
				data.rows[rowId].columns = {};
			}
			data.rows[rowId].columns[key] = normalizeCell(data.rows[rowId].columns[key]);
		});
	}

	return {
		columns,
		rows: data.rows,
	};
};

export const getCellValue = (cell: DataRowsItem) => {
	const { value, current, removed } = cell;
	return {
		value,
		current: removed ? undefined : current,
	};
};

export const Spreadsheet: React.FC = () => {
	const scripts = React.useRef<ScriptsHelper>(new ScriptsHelper());
	const { state, set, redo, undo, clear, length, currentIndex } = useHistory(prepareData(tableData));
	const rootRef = React.useRef<HTMLDivElement | null>(null);

	const [isEditing, setIsEditing] = React.useState<boolean>(false);
	const [rowsSelection, setRowsSelection] = React.useState<[number, number] | null>(null);

	React.useEffect(() => {
		const root = rootRef.current;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "z" && event.ctrlKey) {
				if (event.shiftKey) {
					redo();
				} else {
					undo();
				}
			}
		};

		root?.addEventListener("keydown", handleKeyDown);

		const event = scripts.current.onScript((lines) => {
			console.log(ScriptsHelper.renderScript(scripts.current.initialScript, lines));
		});

		if (!scripts.current.isInitialized) {
			scripts.current.initialize("table");
		}

		return () => {
			event.stop();
			root?.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useDebouncedEffect(
		() => {
			const containsMutations = currentIndex > 0;

			if (containsMutations && !isEditing) {
				setIsEditing(true);
			} else if (!containsMutations && isEditing) {
				setIsEditing(false);
			}
		},
		10,
		[currentIndex],
	);

	const onSelect = useDebouncedCallback((selection: Selection) => {
		setRowsSelection(selection instanceof EntireRowsSelection ? [selection.start, selection.end] : null);
	}, 200);

	return (
		<DataContext.Provider
			value={{
				data: state,
				updateData(current: Data) {
					set(current);
				},
			}}
		>
			<div
				ref={rootRef}
				className={styles["grid-root"]}
			>
				<GridHeader
					isEditing={isEditing}
					isUndo={currentIndex <= 0}
					isRedo={currentIndex >= length}
					selected={rowsSelection !== null}
					onUndo={undo}
					onRedo={redo}
					onCancel={() => {
						clear();
					}}
					onDelete={() => {
						if (!rowsSelection) {
							return;
						}
						const [start, end] = rowsSelection;
						const rows = state.rows.slice(start, end + 1).map(({ rowid }) => rowid);
						scripts.current.push({
							isAsync: true,
							type: "line",
							content: [
								{ name: "table.query", args: [] },
								{ name: "rowid", args: rows },
								{ name: "delete", args: [] },
							],
							sql: {
								type: "delete",
								props: {
									rowid: rows,
								},
							},
						});
					}}
				/>
				<Table onSelect={onSelect} />
				<div className={styles["tabs-bar"]}>
					<div className={styles["actions"]}>
						<button onClick={() => {}}>
							<Icon
								name="mdiPlus"
								title="Novo"
							/>
						</button>
						<button onClick={() => {}}>
							<Icon
								name="mdiMenu"
								title="Tabelas"
							/>
						</button>
					</div>
				</div>
			</div>
		</DataContext.Provider>
	);
};
