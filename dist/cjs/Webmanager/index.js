"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
const Utils_1 = require("../Utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const webManagerDir = `webmanager`;
const createRoutes = (app) => {
    // Lista todas as tabelas disponíveis no banco de dados.
    app.router.get("/:dbName/tables", (req, res) => {
        res.send([]);
    });
    // Cria uma nova tabela.
    app.router.post("/:dbName/tables", (req, res) => {
        res.send({});
    });
    // Retorna todos os registros de uma tabela.
    app.router.get("/:dbName/tables/:tableName/records", (req, res) => {
        res.send([]);
    });
    // Adiciona um novo registro a uma tabela.
    app.router.post("/:dbName/tables/:tableName/records", (req, res) => {
        res.send({});
    });
    // Remove um registro específico de uma tabela.
    app.router.delete("/:dbName/tables/:tableName/records", (req, res) => {
        res.send({});
    });
    // Webmanager sources
    app.router.get(/^\/webmanager\/?(.*)?\/?$/i, (req, res) => {
        const filePath = req.path.slice(webManagerDir.length + 2);
        const assetsPath = path_1.default.join((0, Utils_1.getLocalPath)(), "./sources");
        if (filePath.length === 0) {
            // Send default file
            res.sendFile(path_1.default.join(assetsPath, "/index.html"));
        }
        else if (filePath.startsWith("settings.js")) {
            res.send(`
                window.settings = {
                    "protocol": (window.location.protocol ?? "http").replace(":", ""),
                    "host": window.location.hostname ?? "${app.host}",
                    "port": parseInt(window.location.port ?? "${app.port}"),
                };
            `);
        }
        else {
            const mainFilePath = path_1.default.join(assetsPath, "/", filePath);
            const posiplePath = [mainFilePath, mainFilePath + ".js", mainFilePath + ".ts", path_1.default.join(mainFilePath, "/", "index.js"), path_1.default.join(mainFilePath, "/", "index.ts")];
            for (const p of posiplePath) {
                if (fs_1.default.existsSync(p) && fs_1.default.statSync(p).isFile()) {
                    res.sendFile(p);
                    return;
                }
            }
            res.status(404).send("File not found");
        }
    });
};
exports.createRoutes = createRoutes;
//# sourceMappingURL=index.js.map