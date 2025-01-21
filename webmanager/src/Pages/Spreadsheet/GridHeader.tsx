import { Icon } from "Components";
import styles from "./styles.module.scss";

export const GridHeader: React.FC<{ isEditing: boolean; selected: boolean; onCancel?: () => void }> = ({ isEditing, selected, onCancel }) => {
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
