import { join, dirname } from "path";
import { arch, platform } from "process";
import { statSync } from "fs";
import { ERROR_FACTORY, Errors } from "../../Error";
import { getLocalPath } from "../../Utils";

const supportedPlatforms = [
	["darwin", "x64"],
	["darwin", "arm64"],
	["win32", "x64"],
	["linux", "x64"],
];

const validPlatform = (platform: NodeJS.Platform, arch: NodeJS.Architecture) => {
	return supportedPlatforms.find(([p, a]) => platform == p && arch === a) !== null;
};

const extensionSuffix = (platform: NodeJS.Platform) => {
	if (platform === "win32") return "dll";
	if (platform === "darwin") return "dylib";
	return "so";
};

const platformPackageName = (platform: NodeJS.Platform, arch: NodeJS.Architecture) => {
	const os = platform === "win32" ? "windows" : platform;
	return `${os}-${arch}`;
};

export const implementable = validPlatform(platform, arch);

export const getLoadablePath = () => {
	if (!implementable) {
		throw ERROR_FACTORY.create("SQLiteRegex.getLoadablePath", Errors.INTERNAL_ERROR, {
			message: `Unsupported platform for sqlite-regex, on a ${platform}-${arch} machine, but not in supported platforms (${supportedPlatforms
				.map(([p, a]) => `${p}-${a}`)
				.join(",")}). Consult the sqlite-regex NPM package README for details. `,
		});
	}

	const packageName = platformPackageName(platform, arch);
	let root = getLocalPath();
	let loadablePath = join(root, "lib", packageName, `regex0.${extensionSuffix(platform)}`);

	while (root.split(/[\\\/]/).length > 2) {
		if (!statSync(loadablePath, { throwIfNoEntry: false })) {
			root = dirname(root);
			loadablePath = join(root, "lib", packageName, `regex0.${extensionSuffix(platform)}`);
			continue;
		}
		break;
	}

	if (!statSync(loadablePath, { throwIfNoEntry: false })) {
		throw ERROR_FACTORY.create("SQLiteRegex.getLoadablePath", Errors.INTERNAL_ERROR, {
			message: `Loadble extension for sqlite-regex not found. Was the ${packageName} package installed? Avoid using the --no-optional flag, as the optional dependencies for sqlite-regex are required.`,
		});
	}

	return loadablePath;
};
