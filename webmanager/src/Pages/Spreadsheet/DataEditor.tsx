import { Icon } from "Components";
import React, { useEffect } from "react";
import { CellBase } from "react-spreadsheet";
import styles from "./styles.module.scss";
import { clsx } from "Utils";
import { DataContext, getCellValue } from ".";

const booleanOptions = ["False", "True"];

export const DataEditor: React.FC<{
	cell?: CellBase;
	column: number;
	row: number;
	onChange?: (cell: CellBase) => void;
}> = ({ cell, column, row, onChange }) => {
	const { data, updateData } = React.useContext(DataContext);
	const { key, type = "string", options = [], style: s } = data.columns[column] ?? {};
	const cellData = data.rows?.[row]?.[key] ?? {};

	const isRemoved = cellData.removed ?? false;

	const viewValue = isRemoved ? "" : String(getCellValue(cellData).current ?? "");

	const [value, setValue] = React.useState<string>(viewValue);

	const style = cellData.style ?? s ?? {};

	const isOptions = (type === "string" && options.length > 0) || type === "boolean";

	const isModified = cellData.current !== undefined ? cellData.current !== cellData.value : false;

	const inputType = type === "date" ? "date" : type === "datetime" ? "datetime-local" : ["integer", "float"].includes(type) ? "number" : "text";

	useEffect(() => {
		return () => {
			updateData(data);
			if (cell) onChange?.(cell);
		};
	}, []);

	const onInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>(
		({ target: { value } }) => {
			if (inputType === "number") {
				value = value.replace(/[^0-9\.\-]/g, "");
				value = type === "integer" ? value.replace(/\.([\S]+)?$/, "") : value;
			}
			setValue(value);
			cell!.value = type === "boolean" ? value === "true" : inputType === "number" ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : value;
			if (data.rows[row]) data.rows[row][key] = { ...(data.rows?.[row]?.[key] ?? {}), current: cell!.value };
		},
		[type, inputType],
	);

	return (
		<div
			className={clsx(
				styles["input-root"],
				styles[`input-${inputType}`],
				styles[`input-type-${type}`],
				typeof onChange === "function" ? styles["input-editable"] : "",
				isModified && styles["input-modified"],
				isRemoved && styles["input-removed"],
			)}
			style={{ ...(typeof onChange === "function" ? {} : style) }}
		>
			<span>
				{type === "boolean"
					? ["true", "false"].includes(viewValue.toLowerCase())
						? booleanOptions[viewValue === "true" ? 1 : 0]
						: ""
					: ["date", "datetime"].includes(type) && viewValue.trim() !== ""
					? new Date(viewValue).toLocaleString()
					: viewValue.replace(/\s/gi, "\u00A0")}
			</span>

			{typeof onChange === "function" && !isOptions && (
				<>
					<input
						ref={(e) => {
							e?.focus();
						}}
						type={inputType === "number" ? "text" : inputType}
						value={value}
						onChange={onInputChange}
						step={inputType === "number" ? (type === "float" ? "0.1" : "1") : undefined}
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
					{(type === "boolean" ? ["true", "false"] : options).map((option, i) => (
						<option
							value={option}
							key={i}
						>
							{type === "boolean" ? booleanOptions[option === "true" ? 1 : 0] : option}
						</option>
					))}
				</select>
			)}
		</div>
	);
};
