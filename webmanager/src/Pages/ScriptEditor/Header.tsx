import { HeaderToolbar } from "Components";

export const Header: React.FC<{
	loading?: boolean;
}> = ({ loading }) => {
	return (
		<>
			<HeaderToolbar>
				<HeaderToolbar.Option
					icon="mdiUndo"
					title="Desfazer"
					disabled={loading}
					onClick={() => {}}
				/>
				<HeaderToolbar.Option
					icon="mdiRedo"
					title="Refazer"
					disabled={loading}
					onClick={() => {}}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiReload"
					title="Recarregar"
					disabled={loading}
					onClick={() => {}}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiContentSaveMove"
					label="Publicar"
					disabled={loading}
					onClick={() => {}}
				/>
			</HeaderToolbar>
		</>
	);
};
