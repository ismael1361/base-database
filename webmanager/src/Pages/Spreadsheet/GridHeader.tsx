import { Icon } from "Components";
import styles from "./styles.module.scss";

export const GridHeader: React.FC<{
	loading?: boolean;
	isEditing: boolean;
	isUndo?: boolean;
	isRedo?: boolean;
	selected: boolean;
	onAdd?: () => void;
	onCancel?: () => void;
	onUpdate?: () => void;
	onDelete?: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
}> = ({ loading, isEditing, isUndo, isRedo, selected, onAdd, onUpdate, onCancel, onDelete, onUndo, onRedo }) => {
	return (
		<>
			<div className={styles["grid-toolbar"]}>
				<button
					onClick={onAdd}
					disabled={loading}
				>
					<Icon
						name="mdiPlus"
						title="Adicionar"
					/>
				</button>
				<div className={styles["divider"]}></div>
				<button
					disabled={loading || !selected}
					onClick={onDelete}
				>
					<Icon
						name="mdiDelete"
						title="Deletar"
					/>
				</button>
				<button
					disabled={loading || !isEditing}
					onClick={onUpdate}
				>
					<Icon
						name="mdiCheck"
						title="Atualizar"
					/>
				</button>
				<button
					disabled={loading || !isEditing}
					onClick={onCancel}
				>
					<Icon
						name="mdiClose"
						title="Cancelar"
					/>
				</button>
				<div className={styles["divider"]}></div>
				<button
					disabled={loading || isUndo}
					onClick={onUndo}
				>
					<Icon
						name="mdiUndo"
						title="Desfazer"
					/>
				</button>
				<button
					disabled={loading || isRedo}
					onClick={onRedo}
				>
					<Icon
						name="mdiRedo"
						title="Refazer"
					/>
				</button>
				<div className={styles["divider"]}></div>
				<button
					disabled={loading}
					onClick={() => {}}
				>
					<Icon
						name="mdiReload"
						title="Recarregar"
					/>
				</button>
			</div>
		</>
	);
};
