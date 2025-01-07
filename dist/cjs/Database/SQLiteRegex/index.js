"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadablePath = void 0;
const path_1 = require("path");
const process_1 = require("process");
const fs_1 = require("fs");
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
    return (0, path_1.dirname)(trace
        ?.split("\n")[2]
        .split(" (")[1]
        .replace(/\:(\d+)\:(\d+)\)$/g, "") ?? "./");
};
const getLoadablePath = () => {
    if (!validPlatform(process_1.platform, process_1.arch)) {
        throw new Error(`Unsupported platform for sqlite-regex, on a ${process_1.platform}-${process_1.arch} machine, but not in supported platforms (${supportedPlatforms
            .map(([p, a]) => `${p}-${a}`)
            .join(",")}). Consult the sqlite-regex NPM package README for details. `);
    }
    const packageName = platformPackageName(process_1.platform, process_1.arch);
    let root = getLocalPath();
    let loadablePath = (0, path_1.join)(root, "lib", packageName, `regex0.${extensionSuffix(process_1.platform)}`);
    while (root.split(/[\\\/]/).length > 2) {
        if (!(0, fs_1.statSync)(loadablePath, { throwIfNoEntry: false })) {
            root = (0, path_1.dirname)(root);
            loadablePath = (0, path_1.join)(root, "lib", packageName, `regex0.${extensionSuffix(process_1.platform)}`);
            continue;
        }
        break;
    }
    if (!(0, fs_1.statSync)(loadablePath, { throwIfNoEntry: false })) {
        throw new Error(`Loadble extension for sqlite-regex not found. Was the ${packageName} package installed? Avoid using the --no-optional flag, as the optional dependencies for sqlite-regex are required.`);
    }
    return loadablePath;
};
exports.getLoadablePath = getLoadablePath;
//# sourceMappingURL=index.js.map