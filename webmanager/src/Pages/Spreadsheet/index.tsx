import React from "react";
import styles from "./styles.module.scss";
import { useHistory } from "UseHooks";
import { GridHeader } from "./GridHeader";
import { Table } from "./TableComponents";

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
	rows: Array<Record<PropertyKey, DataRowsItem>> | Record<PropertyKey, Record<PropertyKey, DataRowsItem>>;
}

export const DataContext = React.createContext<{
	data: Data;
	updateData(data: Data): void;
	onColumnSize(calback: (i: number, w: number) => void): (i: number, w: number) => void;
	setColumnSize(i: number, w: number): void;
}>({
	data: {
		columns: [],
		rows: [],
	},
	updateData(data: Data) {},
	onColumnSize(calback: (i: number, w: number) => void) {
		return calback;
	},
	setColumnSize(i: number, w: number) {},
});

const tableData: Data = {
	columns: [
		{ key: "flavour", info: "TEXT", width: 200, align: "center" },
		{ key: "food", width: 200, align: "center" },
		{ key: "none", width: 100, align: "center", options: ["auto", "default"] },
		{ key: "date", width: 200, align: "center", type: "datetime" },
		{ key: "amount", width: 100, align: "center", type: "integer" },
		{ key: "valido", width: 100, align: "center", type: "boolean" },
	],
	rows: [
		{
			flavour: { value: "Vanilla" },
			food: { value: "Ice Cream" },
			none: { value: "" },
			date: { value: "2022-01-01T00:00" },
		},
		{
			flavour: { value: "Chocolate" },
			food: { value: "Cake" },
			none: { value: "" },
		},
		{
			flavour: { value: "Strawberry" },
			food: { value: "Cookies" },
			none: { value: "" },
		},
		{
			flavour: { value: "Mint" },
			food: { value: "Ice Cream" },
			none: { value: "" },
		},
		{
			flavour: { value: "Chocolate" },
			food: { value: "Cake" },
			none: { value: "" },
		},
		{
			flavour: { value: "Vanilla" },
			food: { value: "Cookies" },
			none: { value: "" },
		},
		{
			flavour: { value: "Strawberry" },
			food: { value: "Ice Cream" },
			none: { value: "" },
		},
		{
			flavour: { value: "Mint" },
			food: { value: "Cake" },
			none: { value: "" },
		},
		{
			flavour: { value: "Chocolate" },
			food: { value: "Cookies" },
			none: { value: "" },
		},
		{
			flavour: { value: "Vanilla" },
			food: { value: "Ice Cream" },
			none: { value: "" },
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
			data.rows[rowId][key] = normalizeCell(data.rows[rowId][key]);
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
	const { state, set, redo, undo, clear, length, currentIndex } = useHistory(prepareData(tableData));
	const rootRef = React.useRef<HTMLDivElement | null>(null);

	const [isEditing, setIsEditing] = React.useState<boolean>(false);
	const [selected, setSelected] = React.useState<string | null>(null);
	const callbackColumnSize = React.useRef<(i: number, w: number) => void>(() => {});

	React.useEffect(() => {
		const root = rootRef.current;
		if (root) {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key.toLowerCase() === "z" && event.ctrlKey) {
					if (event.shiftKey) {
						redo();
					} else {
						undo();
					}
				}
			};

			root.addEventListener("keydown", handleKeyDown);

			return () => {
				root.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, []);

	React.useEffect(() => {
		const time = setTimeout(() => {
			const containsMutations = currentIndex > 0;

			if (containsMutations && !isEditing) {
				setIsEditing(true);
			} else if (!containsMutations && isEditing) {
				setIsEditing(false);
			}
		}, 10);

		return () => {
			clearTimeout(time);
		};
	}, [currentIndex]);

	return (
		<DataContext.Provider
			value={{
				data: state,
				updateData(current: Data) {
					set(current);
				},
				onColumnSize(callback) {
					callbackColumnSize.current = callback;
					return callback;
				},
				setColumnSize(i, w) {
					callbackColumnSize.current(i, w);
				},
			}}
		>
			<div
				ref={rootRef}
				className={styles["grid-root"]}
			>
				<GridHeader
					isEditing={isEditing}
					selected={selected !== null}
					onCancel={() => {
						clear();
					}}
				/>
				<Table />
			</div>
		</DataContext.Provider>
	);
};
