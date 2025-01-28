import React, { ReactElement, ReactNode } from "react";
import styles from "./styles.module.scss";
import { clsx } from "Utils";

interface PageProps {
	name: string;
	title?: string;
	children?: ReactNode;
}

const Page: React.FC<PageProps> = ({ children }) => {
	return <>{children}</>;
};

type PageElement = ReactElement<PageProps, typeof Page>;

export const Navigator: React.FC<{
	children?: PageElement | PageElement[];
}> & {
	Page: typeof Page;
} = ({ children }) => {
	const [currentPage, setCurrentPage] = React.useState<string | null>(null);

	const pages = React.useMemo(() => {
		return children
			? React.Children.map(children, ({ props }, index) => {
					return { index, name: (props as any).name, title: (props as any).title } as { index: number; name: string; title?: string };
			  }).filter((v) => typeof v.name === "string")
			: [];
	}, [children]);

	React.useEffect(() => {
		if (!pages.includes(currentPage as any) && pages.length > 0) {
			setCurrentPage(pages[0].name);
		}
	}, [pages]);

	return (
		<div className={styles["navigator"]}>
			<div className={styles["taps"]}>
				{pages.map(({ index, name, title }) => (
					<div
						key={index}
						className={clsx(styles["tap"], currentPage === name && styles["active"])}
						onClick={currentPage === name ? undefined : () => setCurrentPage(name)}
					>
						{title ?? name}
					</div>
				))}
			</div>
			<div className={styles["page"]}>
				{React.Children.map(children, (child) => {
					if (React.isValidElement(child) && (child.props as any).name === currentPage) {
						return child;
					}
				})}
			</div>
		</div>
	);
};

Navigator.Page = Page;
