import { Icon } from "Components";
import styles from "./styles.module.scss";

export const TabsBar: React.FC<{ loading?: boolean }> = ({ loading }) => {
	return (
		<div className={styles["tabs-bar"]}>
			<div className={styles["actions"]}>
				<button
					disabled={loading}
					onClick={() => {}}
				>
					<Icon
						name="mdiPlus"
						title="Novo"
					/>
				</button>
				<button
					disabled={loading}
					onClick={() => {}}
				>
					<Icon
						name="mdiMenu"
						title="Tabelas"
					/>
				</button>
			</div>
		</div>
	);
};
