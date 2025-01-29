import { HeaderToolbar } from "Components";

export const Header: React.FC<{
	loading?: boolean;
}> = ({ loading }) => {
	return (
		<>
			<HeaderToolbar>
				<HeaderToolbar.Option
					icon="mdiPlus"
					title="Adicionar"
					onClick={() => {}}
					disabled={loading}
				/>
				<HeaderToolbar.Divider />
				<HeaderToolbar.Option
					icon="mdiDelete"
					title="Deletar"
					onClick={() => {}}
					disabled={loading}
				/>
				<HeaderToolbar.Option
					icon="mdiCheck"
					title="Atualizar"
					disabled={loading}
					onClick={() => {}}
				/>
				<HeaderToolbar.Option
					icon="mdiClose"
					title="Cancelar"
					disabled={loading}
					onClick={() => {}}
				/>
				<HeaderToolbar.Divider />
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
			</HeaderToolbar>
		</>
	);
};
