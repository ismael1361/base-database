import { Icon, IconName } from "Components";
import styles from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "Utils";

const File: React.FC<{ currentPath?: string; dir: string; name: string; onClick?: (path: string) => void }> = ({ currentPath, dir, name, onClick }) => {
	const path = [dir, name].join("/");

	return (
		<div
			className={clsx(styles["file"], path === currentPath && styles["active"])}
			onClick={
				path === currentPath
					? undefined
					: () => {
							onClick?.(path);
					  }
			}
		>
			<Icon
				name="mdiLanguageTypescript"
				className={styles["icon"]}
			/>
			<span>{name}</span>
		</div>
	);
};

const Folder: React.FC<{ currentPath?: string; dir: string; title: string; files: string[]; onFileOpen?: (path: string) => void }> = ({ currentPath, dir, title, files, onFileOpen }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className={styles["folder"]}>
			<div
				className={styles["title"]}
				onClick={() => setOpen(!open)}
			>
				<Icon name={open ? "mdiChevronDown" : "mdiChevronRight"} />
				<Icon
					name={open ? "mdiFolderOpen" : "mdiFolder"}
					className={styles["icon"]}
				/>
				<span>{title}</span>
			</div>
			{open && (
				<div className={styles["children"]}>
					<Tree
						currentPath={currentPath}
						dir={[dir, title].join("/")}
						files={files}
						onFileOpen={onFileOpen}
					/>
				</div>
			)}
		</div>
	);
};

const Tree: React.FC<{ currentPath?: string; dir: string; files: string[]; onFileOpen?: (path: string) => void }> = ({ dir, currentPath, files, onFileOpen }) => {
	const parsedFiles = files.reduce(
		(acc, file) => {
			if (file.includes("/")) {
				const [folder, ...rest] = file.split("/");
				if (!acc.folders[folder]) {
					acc.folders[folder] = [];
				}
				acc.folders[folder].push(rest.join("/"));
				return acc;
			} else {
				acc.files.push(file);
			}
			return acc;
		},
		{ folders: {}, files: [] } as { folders: Record<string, string[]>; files: string[] },
	);

	return (
		<div className={styles["tree"]}>
			{Object.entries(parsedFiles.folders).map(([title, files]) => {
				return (
					<Folder
						key={title}
						dir={dir}
						currentPath={currentPath}
						title={title}
						files={files}
						onFileOpen={onFileOpen}
					/>
				);
			})}
			{parsedFiles.files.map((name) => {
				return (
					<File
						key={name}
						dir={dir}
						currentPath={currentPath}
						name={name}
						onClick={onFileOpen}
					/>
				);
			})}
		</div>
	);
};

const Group: React.FC<{ currentPath?: string; icon: IconName; title: string; files: string[]; onFileOpen?: (path: string) => void }> = ({ currentPath, icon, title, files, onFileOpen }) => {
	const [open, setOpen] = useState(true);

	return (
		<div className={styles["group"]}>
			<div
				className={styles["header"]}
				onClick={() => setOpen(!open)}
			>
				<Icon name={open ? "mdiChevronDown" : "mdiChevronRight"} />
				<Icon name={icon} />
				<span>{title}</span>
			</div>
			{open && (
				<Tree
					currentPath={currentPath}
					dir={`/${title}`}
					files={files.map((s) => s.replace(new RegExp(`/?${title}/`, "gi"), ""))}
					onFileOpen={onFileOpen}
				/>
			)}
		</div>
	);
};

export const FilesTree: React.FC<{
	currentPath?: string;
	files: { routers: string[]; middlewares: string[]; scripts: string[] };
	onFileOpen?: (path: string) => void;
}> = ({ currentPath, files, onFileOpen }) => {
	return (
		<div className={styles["files"]}>
			<Group
				currentPath={currentPath}
				icon="mdiRoutes"
				title="Routers"
				files={files.routers}
				onFileOpen={onFileOpen}
			/>
			<Group
				currentPath={currentPath}
				icon="mdiPuzzle"
				title="Middlewares"
				files={files.middlewares}
				onFileOpen={onFileOpen}
			/>
			<Group
				currentPath={currentPath}
				icon="mdiScriptText"
				title="Scripts"
				files={files.scripts}
				onFileOpen={onFileOpen}
			/>
		</div>
	);
};
