import { Icon } from "Components";
import React from "react";
import SpreadsheetComponent, {
	CellBase,
	CellComponentProps,
	ColumnIndicatorProps,
	CornerIndicatorProps,
	DataEditorProps,
	HeaderRowProps,
	Matrix,
	Mode,
	Point,
	RowIndicatorProps,
	RowProps,
	TableProps,
} from "react-spreadsheet";
import styles from "./styles.module.scss";
import { clsx, columnIndexToLabel, getOffsetRect } from "Utils";
import { FormControl, MenuItem, Select } from "@mui/material";
import { useHistory } from "UseHooks";

const GridHeader: React.FC<{ isEditing: boolean; selected: boolean; onCancel?: () => void }> = ({ isEditing, selected, onCancel }) => {
	return (
		<>
			<div className={styles["grid-toolbar"]}>
				<button>
					<Icon name="mdiPlus" />
					Add
				</button>
				<button disabled={!selected}>
					<Icon name="mdiDelete" />
					Delete
				</button>
				<button disabled={!isEditing}>
					<Icon name="mdiSquareEditOutline" />
					Update
				</button>
				<button
					disabled={!isEditing}
					onClick={onCancel}
				>
					<Icon name="mdiClose" />
					Cancel
				</button>
			</div>
		</>
	);
};

interface DataRowsItem {
	value: string | number | boolean | null;
	current?: string | number | boolean | null;
	removed?: boolean;
	readOnly?: boolean;
	style?: React.CSSProperties;
}

interface DataColumnsItem {
	key: string;
	header?: string;
	width?: number;
	align?: "left" | "center" | "right";
	style?: React.CSSProperties;
	type?: "string" | "integer" | "float" | "boolean" | "date" | "datetime";
	options?: Array<string>;
}

interface Data {
	columns: Array<DataColumnsItem>;
	rows: Array<Record<PropertyKey, DataRowsItem>> | Record<PropertyKey, Record<PropertyKey, DataRowsItem>>;
}

const DataContext = React.createContext<{
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

const DataEditor: React.FC<{
	cell?: CellBase;
	column: number;
	row: number;
	onChange?: (cell: CellBase) => void;
}> = ({ cell, column, row, onChange }) => {
	const { data, updateData } = React.useContext(DataContext);
	const { key, type = "string", options = [], style: s } = data.columns[column] ?? {};

	const isRemoved = data.rows[row][key]?.removed ?? false;

	const viewValue = isRemoved ? "" : String(data.rows[row][key]?.current ?? data.rows[row][key]?.value ?? "");

	const [value, setValue] = React.useState<string>(viewValue);

	const style = data.rows[row][key]?.style ?? s ?? {};

	const isOptions = type === "string" && options.length > 0;

	const isModified = data.rows[row][key]?.current !== undefined ? data.rows[row][key].current !== data.rows[row][key].value : false;

	const onInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = ({ target: { value } }) => {
		cell!.value = value;
		data.rows[row][key] = { ...(data.rows?.[row]?.[key] ?? {}), current: value };
		updateData(data);
		setValue(value);
		if (cell) onChange?.(cell);
	};

	return (
		<div
			className={clsx(styles["input-root"], typeof onChange === "function" ? styles["input-editable"] : "", isModified && styles["input-modified"], isRemoved && styles["input-removed"])}
			style={{ ...(typeof onChange === "function" ? {} : style) }}
		>
			<span>{["date", "datetime"].includes(type) && viewValue.trim() !== "" ? new Date(viewValue).toLocaleString() : viewValue.replace(/\s/gi, "\u00A0")}</span>

			{typeof onChange === "function" && ["string", "date", "datetime"].includes(type) && !isOptions && (
				<>
					<input
						ref={(e) => {
							e?.focus();
						}}
						type={type === "date" ? "date" : type === "datetime" ? "datetime-local" : "text"}
						value={value}
						onChange={onInputChange}
					/>
					{["date", "datetime"].includes(type) && (
						<div className={styles["icon"]}>
							<Icon name="mdiCalendar" />
						</div>
					)}
				</>
			)}

			{typeof onChange === "function" && isOptions && (
				<select
					ref={(e) => {
						e?.focus();
					}}
					value={value}
					onChange={onInputChange}
				>
					<option
						value=""
						disabled
					>
						None
					</option>
					<option value="volvo">Volvo</option>
					<option value="saab">Saab</option>
					<option value="vw">VW</option>
					<option value="audi">Audi</option>
				</select>
			)}
		</div>
	);
};

const TableComponent: React.FC<TableProps> = ({ columns, children, hideColumnIndicators }) => {
	const { onColumnSize } = React.useContext(DataContext);
	const rootRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		let time: NodeJS.Timeout;

		const callback = onColumnSize((i, w) => {
			clearTimeout(time);
			time = setTimeout(() => {
				const root = rootRef.current;
				if (root) {
					const rows = root.querySelectorAll<HTMLDivElement>(`div.${styles.tr}`);
					const columnWidth: number[] = new Array(columns + 1).fill(0);

					rows.forEach((row, i) => {
						const columns = row.querySelectorAll<HTMLDivElement>(`div.${styles.td}, div.${styles.th}`);
						columns.forEach((column, j) => {
							column.style.width = column.style.minWidth = "";
							const width = column.clientWidth;
							columnWidth[j] = Math.max(columnWidth[j], width);
						});
					});

					rows.forEach((row, i) => {
						const columns = row.querySelectorAll<HTMLDivElement>(`div.${styles.td}, div.${styles.th}`);
						columns.forEach((column, j) => {
							column.style.width = column.style.minWidth = `${columnWidth[j]}px`;
						});
					});

					root.style.width = `${columnWidth.reduce((a, b) => a + b, 0)}px`;
				}
			}, 10);
		});

		const onResize = () => {
			callback(0, 0);
		};

		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			clearTimeout(time);
			onColumnSize(() => {});
		};
	}, [columns, children]);

	return (
		<div
			ref={rootRef}
			className={styles.table}
		>
			{children}
		</div>
	);
};

const CellComponent: React.FC<CellComponentProps> = ({ row, column, DataViewer, selected, active, dragging, mode, data, evaluatedData, select, activate, setCellDimensions, setCellData }) => {
	const { setColumnSize } = React.useContext(DataContext);
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const point = React.useMemo<Point>(
		() => ({
			row,
			column,
		}),
		[row, column],
	);

	const offsetRect = React.useCallback(() => {
		const root = rootRef.current;
		let parent = root?.parentElement;

		try {
			if (root) {
				while (parent && !parent.classList.contains(styles["table"])) {
					parent = parent.parentElement;
				}

				if (!parent) {
					throw new Error("Parent not found");
				}

				const rectParent = getOffsetRect(parent);
				const rectRoot = getOffsetRect(root);

				parent.parentElement?.style.setProperty("--column-width", `${rectRoot.width}px`);

				return {
					width: rectRoot.width,
					height: rectRoot.height,
					left: rectRoot.left - rectParent.left,
					top: rectRoot.top - rectParent.top,
				};
			}
		} catch {}

		return {
			width: 0,
			height: 0,
			left: 0,
			top: 0,
		};
	}, []);

	const handleMouseDown = React.useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (mode === "view") {
				setColumnSize(column, 100);
				setCellDimensions(point, offsetRect());

				if (event.shiftKey) {
					select(point);
				} else {
					activate(point);
				}
			}
		},
		[offsetRect, mode, setCellDimensions, point, select, activate],
	);

	const handleMouseOver = React.useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (dragging) {
				setColumnSize(column, 100);
				setCellDimensions(point, offsetRect());
				select(point);
			}
		},
		[offsetRect, setCellDimensions, select, dragging, point],
	);

	React.useEffect(() => {
		const root = rootRef.current;
		setColumnSize(column, 100);
		if (selected && root) {
			setCellDimensions(point, offsetRect());
		}
		if (root && active && mode === "view") {
			root.focus();
		}
	}, [offsetRect, setCellDimensions, selected, active, mode, point, data]);

	if (data && data.DataViewer) {
		// @ts-ignore
		DataViewer = data.DataViewer;
	}

	return (
		<div
			ref={rootRef}
			className={clsx(styles.td, data?.className, data?.readOnly && styles.readonly)}
			onMouseOver={handleMouseOver}
			onMouseDown={handleMouseDown}
			role="cell"
			tabIndex={0}
		>
			<DataViewer
				row={row}
				column={column}
				cell={data}
				evaluatedCell={evaluatedData}
				setCellData={setCellData}
			/>
		</div>
	);
};

const HeaderRowComponent: React.FC<HeaderRowProps> = ({ children }) => {
	return (
		<header>
			<div
				className={styles.tr}
				role="row"
			>
				{children}
			</div>
		</header>
	);
};

const RowComponent: React.FC<RowProps> = ({ row, children }) => {
	return (
		<div
			className={styles.tr}
			role="row"
		>
			{children}
		</div>
	);
};

const ColumnIndicatorComponent: React.FC<ColumnIndicatorProps> = ({ column, onSelect, selected, label }) => {
	const handleClick = React.useCallback(
		(event: React.MouseEvent) => {
			onSelect(column, event.shiftKey);
		},
		[onSelect, column],
	);
	return (
		<div
			className={clsx(styles.th, selected && styles.selected)}
			role="columnheader"
			onClick={handleClick}
			tabIndex={0}
		>
			<span>{label !== undefined ? label : columnIndexToLabel(column)}</span>
		</div>
	);
};

const RowIndicatorComponent: React.FC<RowIndicatorProps> = ({ onSelect, row, selected, label }) => {
	const handleClick = React.useCallback(
		(event: React.MouseEvent) => {
			onSelect(row, event.shiftKey);
		},
		[onSelect, row],
	);
	return (
		<div
			className={clsx(styles.th, styles["row-indicator"], selected && styles.selected)}
			role="columnheader"
			onClick={handleClick}
			tabIndex={0}
		>
			<span>{label !== undefined ? label : row + 1}</span>
		</div>
	);
};

const CornerIndicatorComponent: React.FC<CornerIndicatorProps> = ({ onSelect, selected }) => {
	const handleClick = React.useCallback(() => {
		onSelect();
	}, [onSelect]);
	return (
		<div
			className={clsx(styles.th, styles["corner-indicator"], selected && styles.selected)}
			role="columnheader"
			onClick={handleClick}
			tabIndex={0}
		></div>
	);
};

const Table: React.FC = () => {
	const { data, setColumnSize, updateData } = React.useContext(DataContext);
	const modeChangeRef = React.useRef<Mode>("view");

	const columnLabels = data.columns.map(({ key, header }, i) => header ?? key) as string[];
	const rowLabels = Object.keys(data.rows).map((header, i) => (Array.isArray(data.rows) ? `${i + 1}` : header));
	const cells = Object.values(data.rows).map((row) =>
		data.columns.map(({ key }) => {
			const { value, current, removed, ...props } = row[key] ?? {};
			return { ...props, value: removed ? undefined : current ?? value };
		}),
	) as Matrix<CellBase>;

	return (
		<SpreadsheetComponent
			className={styles["table-root"]}
			darkMode={true}
			data={cells}
			onChange={(d) => {
				setColumnSize(0, 50);
				if (modeChangeRef.current === "view") {
					d.forEach((row, j) => {
						row.forEach((cell, i) => {
							if (!cell) return;
							const { value } = cell;
							const key = data.columns[i].key;
							const before = data.rows[j][key]?.value;
							data.rows[j][key] = { ...(data.rows?.[j]?.[key] ?? {}), current: value, removed: value === undefined && before !== undefined };
						});
					});

					updateData(data);
				}
			}}
			onModeChange={(m) => (modeChangeRef.current = m)}
			columnLabels={columnLabels}
			rowLabels={rowLabels}
			Table={TableComponent}
			ColumnIndicator={ColumnIndicatorComponent}
			Cell={CellComponent}
			DataEditor={DataEditor as any}
			DataViewer={DataEditor as any}
			HeaderRow={HeaderRowComponent}
			Row={RowComponent}
			RowIndicator={RowIndicatorComponent}
			CornerIndicator={CornerIndicatorComponent}
		/>
	);
};

const tableData: Data = {
	columns: [
		{ key: "flavour", header: "Flavour", width: 100, align: "center" },
		{ key: "food", header: "Food", width: 100, align: "center" },
		{ key: "none", header: "", width: 100, align: "center", options: ["", "auto", "default"] },
		{ key: "date", header: "Date", width: 100, align: "center", type: "datetime" },
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

export const Spreadsheet: React.FC = () => {
	const { state, set, redo, undo, clear } = useHistory(tableData);
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
			const containsMutations = Object.values(state.rows).some((row) => Object.values(row).some((cell) => (cell?.current !== undefined || cell?.removed) && cell?.current !== cell.value));

			if (containsMutations && !isEditing) {
				setIsEditing(true);
			} else if (!containsMutations && isEditing) {
				setIsEditing(false);
			}
		}, 10);

		return () => {
			clearTimeout(time);
		};
	}, [state]);

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
