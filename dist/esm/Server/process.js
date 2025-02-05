#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { program } from "commander";
const PID_FILE = path.join(__dirname, "meu-daemon.pid");
function startDaemon(options) {
    if (fs.existsSync(PID_FILE)) {
        console.log("Daemon is already running.");
        return;
    }
    options.path = path.resolve(process.cwd(), options.path);
    const daemon = spawn("node", [__filename, "start", "--daemon", "--port", options.port, "--host", options.host, "--path", options.path], {
        detached: true,
        stdio: "ignore",
        cwd: process.cwd(),
    });
    daemon.unref();
    fs.writeFileSync(PID_FILE, JSON.stringify({
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
    if (fs.existsSync(PID_FILE)) {
        const options = fs.readFileSync(PID_FILE, "utf8");
        try {
            const { pid } = JSON.parse(options);
            process.kill(parseInt(pid), "SIGTERM"); // Encerra o processo
            console.log(`Daemon with PID ${pid} has been stopped.`);
        }
        catch (err) {
            console.log(`Failed to stop daemon: ${err?.message ?? String(err)}`);
        }
        fs.unlinkSync(PID_FILE); // Remove o arquivo de PID
    }
    else {
        console.log("No daemon is running.");
    }
}
async function workDaemon(options) {
    const { Daemon } = await import("./daemon");
    new Daemon(options.host, parseInt(options.port), options.path);
    process.on("SIGTERM", () => {
        process.exit(0);
    });
}
function infoDaemon() {
    if (fs.existsSync(PID_FILE)) {
        const options = fs.readFileSync(PID_FILE, "utf8");
        const { pid, port, host, path } = JSON.parse(options);
        console.log(`Daemon is running with PID: ${pid}`);
        console.log(`Server running on http://${host}:${port}`);
        console.log(`Path to settings dir: ${path}`);
    }
    else {
        console.log("No daemon is running.");
    }
}
program
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
program
    .command("stop")
    .description("Stop the daemon")
    .action(() => {
    stopDaemon();
});
program
    .command("show")
    .description("Show information about the daemon")
    .action(() => {
    infoDaemon();
});
program.parse(process.argv);
//# sourceMappingURL=process.js.map