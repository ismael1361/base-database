import { Icon } from "Components";
import React from "react";
import SpreadsheetComponent, { CellBase, DataEditorProps, Matrix } from "react-spreadsheet";
import styles from "./styles.module.scss";
import { clsx, columnIndexToLabel } from "Utils";
import { FormControl, MenuItem, Select } from "@mui/material";

const GridHeader: React.FC<{ isEditing: boolean; selected: boolean }> = ({ isEditing, selected }) => {
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
				<button disabled={!isEditing}>
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

const DataContext = React.createContext<{ data: Data; modifiedCells: Array<[number, number]>; getData(): Data; updateData(data: Data): void }>({
	data: {
		columns: [],
		rows: [],
	},
	modifiedCells: [],
	getData() {
		return {
			columns: [],
			rows: [],
		};
	},
	updateData(data: Data) {},
});

const TableCell: React.FC<{
	cell?: CellBase;
	column: number;
	row: number;
	onChange?: (cell: CellBase) => void;
}> = ({ cell, column, row, onChange }) => {
	const { data, modifiedCells, updateData } = React.useContext(DataContext);
	const { key, type = "string", options = [], style: s } = data.columns[column] ?? {};
	const viewValue = String(data.rows[row][key]?.current ?? data.rows[row][key]?.value ?? cell?.value ?? "");
	const [value, setValue] = React.useState<string>(viewValue);

	const style = data.rows[row][key]?.style ?? s ?? {};

	const isOptions = type === "string" && options.length > 0;

	const isModified = data.rows[row][key]?.current !== undefined ? data.rows[row][key].current !== data.rows[row][key].value : false;

	const onInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = ({ target: { value } }) => {
		cell!.value = value;
		data.rows[row][key]!.current = value;
		updateData(data);
		setValue(value);
		if (cell) onChange?.(cell);
	};

	return (
		<div
			className={clsx(styles["input-root"], typeof onChange === "function" ? styles["input-editable"] : "", isModified && styles["input-modified"])}
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
					defaultValue={value}
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

const Table: React.FC = () => {
	const { getData } = React.useContext(DataContext);

	const data = getData();
	const columnLabels = data.columns.map(({ key, header }, i) => header ?? key ?? columnIndexToLabel(i));
	const rowLabels = Object.keys(data.rows).map((header, i) => header ?? `${i + 1}`);
	const cells = Object.values(data.rows).map((row) =>
		data.columns.map(({ key }) => {
			const { value, current, ...props } = row[key] ?? {};
			return { ...props, value: current ?? value };
		}),
	) as Matrix<CellBase>;

	return (
		<div className={styles["table-root"]}>
			<SpreadsheetComponent
				darkMode={true}
				data={cells}
				columnLabels={columnLabels}
				rowLabels={rowLabels}
				DataEditor={TableCell}
				DataViewer={TableCell}
			/>
		</div>
	);
};

export const Spreadsheet: React.FC = () => {
	const data = React.useRef<Data>({
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
	});
	const [isEditing, setIsEditing] = React.useState<boolean>(false);
	const [selected, setSelected] = React.useState<string | null>(null);

	return (
		<DataContext.Provider
			value={{
				data: data.current,
				modifiedCells: [],
				getData() {
					return { ...data.current };
				},
				updateData(current: Data) {
					data.current = { ...current };
					const containsMutations = Object.values(current.rows).some((row) => Object.values(row).some((cell) => cell.current !== undefined && cell.current !== cell.value));

					if (containsMutations && !isEditing) {
						setIsEditing(true);
					} else if (!containsMutations && isEditing) {
						setIsEditing(false);
					}
				},
			}}
		>
			<div className={styles["grid-root"]}>
				<GridHeader
					isEditing={isEditing}
					selected={selected !== null}
				/>
				<Table />
			</div>
		</DataContext.Provider>
	);
};
