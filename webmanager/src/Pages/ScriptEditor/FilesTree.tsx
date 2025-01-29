import { Icon, IconName } from "Components";
import styles from "./styles.module.scss";
import { useState } from "react";
import { clsx } from "Utils";

export type Files = Array<{ path: string; createDate: Date; modifiedDate: Date }>;

const File: React.FC<{ currentPath?: string; dir: string; name: string; createDate: Date; modifiedDate: Date; onClick?: (path: string) => void }> = ({
	currentPath,
	dir,
	name,
	createDate,
	modifiedDate,
	onClick,
}) => {
	const path = [dir, name].join("/");

	return (
		<div
			className={clsx(styles["file"], path === currentPath && styles["active"], createDate.getTime() !== modifiedDate.getTime() && styles["modified"])}
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

const Folder: React.FC<{ currentPath?: string; dir: string; title: string; files: Files; onFileOpen?: (path: string) => void }> = ({ currentPath, dir, title, files, onFileOpen }) => {
	const [open, setOpen] = useState(false);

	const isHasModified = files.some(({ createDate, modifiedDate }) => createDate.getTime() !== modifiedDate.getTime());

	return (
		<div className={styles["folder"]}>
			<div
				className={clsx(styles["title"], isHasModified && styles["modified"])}
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

const Tree: React.FC<{ currentPath?: string; dir: string; files: Files; onFileOpen?: (path: string) => void }> = ({ dir, currentPath, files, onFileOpen }) => {
	const parsedFiles = files.reduce(
		(acc, file) => {
			if (file.path.includes("/")) {
				const [folder, ...rest] = file.path.split("/");
				if (!acc.folders[folder]) {
					acc.folders[folder] = [];
				}
				acc.folders[folder].push({ ...file, path: rest.join("/") });
				return acc;
			} else {
				acc.files.push(file);
			}
			return acc;
		},
		{ folders: {}, files: [] } as { folders: Record<string, Files>; files: Files },
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
			{parsedFiles.files.map(({ path, createDate, modifiedDate }) => {
				return (
					<File
						key={path}
						dir={dir}
						currentPath={currentPath}
						name={path}
						createDate={createDate}
						modifiedDate={modifiedDate}
						onClick={onFileOpen}
					/>
				);
			})}
		</div>
	);
};

const Group: React.FC<{ currentPath?: string; icon: IconName; title: string; files: Files; onFileOpen?: (path: string) => void }> = ({ currentPath, icon, title, files, onFileOpen }) => {
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
					files={files.map(({ path, ...p }) => {
						path = path.replace(new RegExp(`/?${title}/`, "gi"), "");
						return { path, ...p };
					})}
					onFileOpen={onFileOpen}
				/>
			)}
		</div>
	);
};

export const FilesTree: React.FC<{
	currentPath?: string;
	files: { routers: Files; middlewares: Files; scripts: Files };
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
