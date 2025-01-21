import { Icon } from "Components";
import React from "react";
import { CellBase } from "react-spreadsheet";
import styles from "./styles.module.scss";
import { clsx } from "Utils";
import { DataContext } from ".";

export const DataEditor: React.FC<{
	cell?: CellBase;
	column: number;
	row: number;
	onChange?: (cell: CellBase) => void;
}> = ({ cell, column, row, onChange }) => {
	const { data, updateData } = React.useContext(DataContext);
	const timeDelay = React.useRef<NodeJS.Timeout>();
	const { key, type = "string", options = [], style: s } = data.columns[column] ?? {};

	const isRemoved = data.rows[row][key]?.removed ?? false;

	const viewValue = isRemoved ? "" : String(data.rows[row][key]?.current ?? data.rows[row][key]?.value ?? "");

	const [value, setValue] = React.useState<string>(viewValue);

	const style = data.rows[row][key]?.style ?? s ?? {};

	const isOptions = type === "string" && options.length > 0;

	const isModified = data.rows[row][key]?.current !== undefined ? data.rows[row][key].current !== data.rows[row][key].value : false;

	const onInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>(({ target: { value } }) => {
		clearTimeout(timeDelay.current);
		setValue(value);
		timeDelay.current = setTimeout(() => {
			cell!.value = value;
			data.rows[row][key] = { ...(data.rows?.[row]?.[key] ?? {}), current: value };
			updateData(data);
			if (cell) onChange?.(cell);
		}, 100);
	}, []);

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
