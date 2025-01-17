import { Icon } from "Components";
import React from "react";
import SpreadsheetComponent, { CellBase, DataEditorProps, Matrix } from "react-spreadsheet";
import styles from "./styles.module.scss";

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

const TableCell: React.FC<DataEditorProps<CellBase>> = ({ cell, onChange }) => {
	return (
		<input
			value={cell?.value ?? ""}
			onChange={({ target: { value } }) => onChange({ ...(cell ?? {}), value })}
		/>
	);
};

const Table: React.FC = () => {
	const columnLabels = ["Flavour", "Food", ""];
	const rowLabels = ["Item 1", "Item 2"];

	const [data, setData] = React.useState<Matrix<CellBase>>([
		[{ value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[
			{ value: "Strawberry" },
			{ value: "Cookies" },
			{ value: "Vanilla" },
			{ value: "Chocolate" },
			{ value: "Vanilla" },
			{ value: "Chocolate" },
			{ value: "Vanilla" },
			{ value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor." },
		],
		[{ value: "Mint" }, { value: "Ice Cream" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Chocolate" }, { value: "Cake" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Vanilla" }, { value: "Cookies" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Chocolate" }, { value: "Ice Cream" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Vanilla" }, { value: "Cake" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Strawberry" }, { value: "Cookies" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
		[{ value: "Mint" }, { value: "Ice Cream" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }, { value: "Vanilla" }, { value: "Chocolate" }],
	]);

	return (
		<div className={styles["table-root"]}>
			<SpreadsheetComponent
				data={data}
				columnLabels={columnLabels}
				rowLabels={rowLabels}
				onChange={setData}
				DataEditor={TableCell}
			/>
		</div>
	);
};

export const Spreadsheet: React.FC = () => {
	const [isEditing, setIsEditing] = React.useState<boolean>(false);
	const [selected, setSelected] = React.useState<string | null>(null);

	return (
		<div className={styles["grid-root"]}>
			<GridHeader
				isEditing={isEditing}
				selected={selected !== null}
			/>
			<Table />
		</div>
	);
};
