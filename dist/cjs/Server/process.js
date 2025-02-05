#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const commander_1 = require("commander");
const PID_FILE = path_1.default.join(__dirname, "meu-daemon.pid");
function startDaemon(options) {
    if (fs_1.default.existsSync(PID_FILE)) {
        console.log("Daemon is already running.");
        return;
    }
    options.path = path_1.default.resolve(process.cwd(), options.path);
    const daemon = (0, child_process_1.spawn)("node", [__filename, "start", "--daemon", "--port", options.port, "--host", options.host, "--path", options.path], {
        detached: true,
        stdio: "ignore",
        cwd: process.cwd(),
    });
    daemon.unref();
    fs_1.default.writeFileSync(PID_FILE, JSON.stringify({
        pid: daemon.pid?.toString() ?? "",
        port: options.port,
        host: options.host,
        path: options.path,
    }));
    console.log(`Daemon started with PID: ${daemon.pid}`);
    console.log(`Server running on http://${options.host}:${options.port}`);
    console.log(`Path to settings dir: ${options.path}`);
}
function stopDaemon() {
    if (fs_1.default.existsSync(PID_FILE)) {
        const options = fs_1.default.readFileSync(PID_FILE, "utf8");
        try {
            const { pid } = JSON.parse(options);
            process.kill(parseInt(pid), "SIGTERM"); // Encerra o processo
            console.log(`Daemon with PID ${pid} has been stopped.`);
        }
        catch (err) {
            console.log(`Failed to stop daemon: ${err?.message ?? String(err)}`);
        }
        fs_1.default.unlinkSync(PID_FILE); // Remove o arquivo de PID
    }
    else {
        console.log("No daemon is running.");
    }
}
async function workDaemon(options) {
    const { Daemon } = await Promise.resolve().then(() => __importStar(require("./daemon")));
    new Daemon(options.host, parseInt(options.port), options.path);
    process.on("SIGTERM", () => {
        process.exit(0);
    });
}
function infoDaemon() {
    if (fs_1.default.existsSync(PID_FILE)) {
        const options = fs_1.default.readFileSync(PID_FILE, "utf8");
        const { pid, port, host, path } = JSON.parse(options);
        console.log(`Daemon is running with PID: ${pid}`);
        console.log(`Server running on http://${host}:${port}`);
        console.log(`Path to settings dir: ${path}`);
    }
    else {
        console.log("No daemon is running.");
    }
}
commander_1.program
    .command("start")
    .description("Start the daemon")
    .option("--daemon", "Run the process in the background")
    .option("--port <port>", "Port to run the server", "3000")
    .option("--host <host>", "Host to run the server", "localhost")
    .option("--path <path>", "Path to setings dir", "/server-db-settings")
    .action((options) => {
    if (options.daemon) {
        workDaemon(options);
    }
    else {
        startDaemon(options);
    }
});
commander_1.program
    .command("stop")
    .description("Stop the daemon")
    .action(() => {
    stopDaemon();
});
commander_1.program
    .command("show")
    .description("Show information about the daemon")
    .action(() => {
    infoDaemon();
});
commander_1.program.parse(process.argv);
//# sourceMappingURL=process.js.map