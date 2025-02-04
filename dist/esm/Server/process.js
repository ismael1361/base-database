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
    options.path = fs.existsSync(path.resolve(options.path)) ? path.resolve(options.path) : path.resolve(process.cwd(), options.path);
    const daemon = spawn("node", [__filename, "start", "--daemon", "--port", options.port, "--host", options.host, "--path", options.path], {
        detached: true,
        stdio: "ignore",
        cwd: process.cwd(),
    });
    daemon.unref();
    fs.writeFileSync(PID_FILE, daemon.pid?.toString() ?? "");
    console.log(`Daemon started with PID: ${daemon.pid}`);
    console.log(`Server running on http://${options.host}:${options.port}`);
    console.log(`Path to settings files: ${options.path}`);
}
function stopDaemon() {
    if (fs.existsSync(PID_FILE)) {
        const pid = fs.readFileSync(PID_FILE, "utf8");
        try {
            process.kill(parseInt(pid), "SIGTERM"); // Encerra o processo
            console.log(`Daemon with PID ${pid} has been stopped.`);
        }
        catch (err) {
            console.log(`Failed to stop daemon with PID ${pid}: ${err?.message ?? String(err)}`);
        }
        fs.unlinkSync(PID_FILE); // Remove o arquivo de PID
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
    .option("--path <path>", "Path to setings files", "/")
    .action((options) => {
    if (options.daemon) {
        console.log("Daemon is running in the background...");
        // Código do daemon
        const interval = setInterval(() => {
            console.log("Daemon is still running...");
        }, 5000);
        // Lidar com o sinal de término (SIGTERM) para encerrar o daemon corretamente
        process.on("SIGTERM", () => {
            clearInterval(interval); // Parar o intervalo
            console.log("Daemon is shutting down...");
            process.exit(0); // Encerrar o processo
        });
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
program.parse(process.argv);
//# sourceMappingURL=process.js.map