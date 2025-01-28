import { Icon, IconName } from "../Icon";
import styles from "./styles.module.scss";

const Option: React.FC<{ title?: string; icon: IconName; disabled?: boolean; onClick?: () => void }> = ({ icon, title, disabled, onClick }) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled || !onClick}
		>
			<Icon
				name={icon}
				title={title}
			/>
		</button>
	);
};

const Divider: React.FC = () => {
	return <div className={styles["divider"]}></div>;
};

export const HeaderToolbar: React.FC<{
	children?: React.ReactElement<typeof Option | typeof Divider> | React.ReactElement<typeof Option | typeof Divider>[];
}> & {
	Option: typeof Option;
	Divider: typeof Divider;
} = ({ children }) => {
	return <div className={styles["header-toolbar"]}>{children}</div>;
};

HeaderToolbar.Option = Option;
HeaderToolbar.Divider = Divider;
