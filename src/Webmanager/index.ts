import { getLocalPath } from "../Utils";
import type { ServerManager } from "../Server";
import path from "path";
import fs from "fs";

const webManagerDir = `webmanager`;

export const createRoutes = (app: ServerManager): void => {
	// Lista todas as tabelas disponíveis no banco de dados.
	app.router.get("/database/:dbName/tables", (req, res) => {
		res.send([]);
	});

	// Cria uma nova tabela.
	app.router.post("/database/:dbName/tables", (req, res) => {
		res.send({});
	});

	// Retorna todos os registros de uma tabela.
	app.router.get("/database/:dbName/tables/:tableName/records", (req, res) => {
		res.send([]);
	});

	// Adiciona um novo registro a uma tabela.
	app.router.post("/database/:dbName/tables/:tableName/records", (req, res) => {
		res.send({});
	});

	// Remove um registro específico de uma tabela.
	app.router.delete("/database/:dbName/tables/:tableName/records", (req, res) => {
		res.send({});
	});

	// Webmanager sources
	app.router.get(/^\/webmanager\/?(.*)?\/?$/i, (req, res) => {
		const filePath = req.path.slice(webManagerDir.length + 2);
		const assetsPath = path.join(getLocalPath(), "./sources");

		if (filePath.length === 0) {
			// Send default file
			res.sendFile(path.join(assetsPath, "/index.html"));
		} else if (filePath.startsWith("settings.js")) {
			res.send(`
                window.settings = {
                    "protocol": (window.location.protocol ?? "http").replace(":", ""),
                    "host": window.location.hostname ?? "${app.host}",
                    "port": parseInt(window.location.port ?? "${app.port}"),
                };
            `);
		} else {
			const mainFilePath = path.join(assetsPath, "/", filePath);
			const posiplePath = [mainFilePath, mainFilePath + ".js", mainFilePath + ".ts", path.join(mainFilePath, "/", "index.js"), path.join(mainFilePath, "/", "index.ts")];
			for (const p of posiplePath) {
				if (fs.existsSync(p) && fs.statSync(p).isFile()) {
					res.sendFile(p);
					return;
				}
			}
			res.status(404).send("File not found");
		}
	});
};
