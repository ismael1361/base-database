import { join, dirname } from "path";
import { arch, platform } from "process";
import { statSync } from "fs";
const supportedPlatforms = [
    ["darwin", "x64"],
    ["darwin", "arm64"],
    ["win32", "x64"],
    ["linux", "x64"],
];
const validPlatform = (platform, arch) => {
    return supportedPlatforms.find(([p, a]) => platform == p && arch === a) !== null;
};
const extensionSuffix = (platform) => {
    if (platform === "win32")
        return "dll";
    if (platform === "darwin")
        return "dylib";
    return "so";
};
const platformPackageName = (platform, arch) => {
    const os = platform === "win32" ? "windows" : platform;
    return `${os}-${arch}`;
};
const getLocalPath = () => {
    const trace = new Error().stack;
    return dirname(trace
        ?.split("\n")[2]
        .split(" (")[1]
        .replace(/\:(\d+)\:(\d+)\)$/g, "") ?? "./");
};
export const getLoadablePath = () => {
    if (!validPlatform(platform, arch)) {
        throw new Error(`Unsupported platform for sqlite-regex, on a ${platform}-${arch} machine, but not in supported platforms (${supportedPlatforms
            .map(([p, a]) => `${p}-${a}`)
            .join(",")}). Consult the sqlite-regex NPM package README for details. `);
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
        throw new Error(`Loadble extension for sqlite-regex not found. Was the ${packageName} package installed? Avoid using the --no-optional flag, as the optional dependencies for sqlite-regex are required.`);
    }
    return loadablePath;
};
//# sourceMappingURL=index.js.map