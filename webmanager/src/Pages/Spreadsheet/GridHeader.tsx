import { Icon } from "Components";
import styles from "./styles.module.scss";

export const GridHeader: React.FC<{ isEditing: boolean; selected: boolean; onAdd?: () => void; onCancel?: () => void; onUpdate?: () => void; onDelete?: () => void }> = ({
	isEditing,
	selected,
	onAdd,
	onUpdate,
	onCancel,
	onDelete,
}) => {
	return (
		<>
			<div className={styles["grid-toolbar"]}>
				<button onClick={onAdd}>
					<Icon name="mdiPlus" />
					Add
				</button>
				<button
					disabled={!selected}
					onClick={onDelete}
				>
					<Icon name="mdiDelete" />
					Delete
				</button>
				<button
					disabled={!isEditing}
					onClick={onUpdate}
				>
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
