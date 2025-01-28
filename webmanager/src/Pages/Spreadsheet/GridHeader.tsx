import { HeaderToolbar, Icon } from "Components";
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
			<HeaderToolbar>
				<HeaderToolbar.Option
					icon="mdiPlus"
					title="Adicionar"
					onClick={onAdd}
					disabled={loading}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiDelete"
					title="Deletar"
					onClick={onDelete}
					disabled={loading || !selected}
				/>
				<HeaderToolbar.Option
					icon="mdiCheck"
					title="Atualizar"
					disabled={loading || !isEditing}
					onClick={onUpdate}
				/>
				<HeaderToolbar.Option
					icon="mdiClose"
					title="Cancelar"
					disabled={loading || !isEditing}
					onClick={onCancel}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiUndo"
					title="Desfazer"
					disabled={loading || isUndo}
					onClick={onUndo}
				/>
				<HeaderToolbar.Option
					icon="mdiRedo"
					title="Refazer"
					disabled={loading || isRedo}
					onClick={onRedo}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiReload"
					title="Recarregar"
					disabled={loading}
					onClick={() => {}}
				/>
			</HeaderToolbar>
		</>
	);
};
