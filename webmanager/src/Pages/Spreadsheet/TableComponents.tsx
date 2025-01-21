import React from "react";
import SpreadsheetComponent, {
	CellBase,
	CellComponentProps,
	ColumnIndicatorProps,
	CornerIndicatorProps,
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
import { DataEditor } from "./DataEditor";
import { DataContext, getCellValue } from ".";

export const TableComponent: React.FC<TableProps> = ({ columns, children, hideColumnIndicators }) => {
	const { data, onColumnSize } = React.useContext(DataContext);
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const columnsSizes = React.useRef<number[]>(new Array(columns + 1).fill(0).map((_, i) => (i === 0 ? 50 : data.columns[i - 1].width ?? 200)));

	const updateColumnsSizes = React.useCallback(() => {
		const root = rootRef.current;
		if (root) {
			const rows = root.querySelectorAll<HTMLDivElement>(`div.${styles.tr}`);

			root.querySelectorAll<HTMLDivElement>(`div.${styles["row-indicator"]}`).forEach((column) => {
				column.style.width = column.style.minWidth = "";
				columnsSizes.current[0] = Math.max(columnsSizes.current[0], column.offsetWidth);
			});

			const columnWidth: number[] = columnsSizes.current;

			rows.forEach((row, i) => {
				const columns = row.querySelectorAll<HTMLDivElement>(`div.${styles.td}, div.${styles.th}`);
				columns.forEach((column, j) => {
					column.style.width = column.style.minWidth = `${columnWidth[j]}px`;
				});
			});

			root.style.width = `${columnWidth.reduce((a, b) => a + b, 0)}px`;
		}
	}, []);

	React.useLayoutEffect(() => {
		let time: NodeJS.Timeout;

		const callback = onColumnSize((i, w) => {
			clearTimeout(time);
			time = setTimeout(() => {
				updateColumnsSizes();
			}, 100);
		});

		const onResize = () => {
			callback(0, 0);
		};

		window.addEventListener("resize", onResize);

		updateColumnsSizes();

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

export const CellComponent: React.FC<CellComponentProps> = ({ row, column, DataViewer, selected, active, dragging, mode, data, evaluatedData, select, activate, setCellDimensions, setCellData }) => {
	// const { setColumnSize } = React.useContext(DataContext);
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
				setCellDimensions(point, offsetRect());
				select(point);
			}
		},
		[offsetRect, setCellDimensions, select, dragging, point],
	);

	React.useEffect(() => {
		const root = rootRef.current;
		if (selected && root) {
			setCellDimensions(point, offsetRect());
		}
		if (root && active && mode === "view") {
			root.focus();
		}
	}, [offsetRect, setCellDimensions, selected, active, mode, point, data]);

	// useSizeEffect(
	// 	rootRef,
	// 	() => {
	// 		updateCellDimensions();
	// 	},
	// 	[updateCellDimensions],
	// );

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

export const HeaderRowComponent: React.FC<HeaderRowProps> = ({ children }) => {
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

export const RowComponent: React.FC<RowProps> = ({ row, children }) => {
	const { data } = React.useContext(DataContext);
	if (!data.rows[row]) {
		return null;
	}
	return (
		<div
			className={styles.tr}
			role="row"
		>
			{children}
		</div>
	);
};

export const ColumnIndicatorComponent: React.FC<ColumnIndicatorProps> = ({ column, onSelect, selected, label }) => {
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

export const RowIndicatorComponent: React.FC<RowIndicatorProps> = ({ onSelect, row, selected, label }) => {
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

export const CornerIndicatorComponent: React.FC<CornerIndicatorProps> = ({ onSelect, selected }) => {
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

export const Table: React.FC = () => {
	const { data, setColumnSize, updateData } = React.useContext(DataContext);
	const modeChangeRef = React.useRef<Mode>("view");

	const columnLabels = data.columns.map(({ key, header }, i) => header ?? key) as string[];
	const rowLabels = Object.keys(data.rows).map((header, i) => (Array.isArray(data.rows) ? `${i + 1}` : header));
	const cells = Object.values(data.rows).map((row) =>
		data.columns.map(({ key }) => {
			const cell = row[key] ?? {};
			const { current } = getCellValue(cell);
			return { ...cell, value: current };
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
							if (!cell || !data.columns[i] || !data.rows[j]) {
								return;
							}
							const { value } = cell;
							const { key, type = "string" } = data.columns[i];
							const c = data.rows?.[j]?.[key] ?? {};

							const current =
								value === null || value === undefined
									? value
									: type === "boolean"
									? String(value) === "true"
									: ["integer", "float"].includes(type)
									? isNaN(parseFloat(value))
										? 0
										: parseFloat(value)
									: value;

							data.rows[j][key] = { ...c, current, removed: current === undefined && getCellValue(c).value !== undefined };
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
