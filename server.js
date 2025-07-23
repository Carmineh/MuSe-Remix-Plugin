import http from "http";
import { exec } from "child_process";
import { parse } from "url";
import { fileURLToPath } from "url";
import path from "path";

// Calcola path assoluto verso la repo MuSe -> Cartella MuSe e MuSe-Remix-plugin nella stessa cartella
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUMO_REPO_PATH = path.resolve(__dirname, "../MuSe");
const PORT = 3001;

// Esecuzione del comando "npx sumo COMMAND PARAMETER"
function runSumoCommand(argsArray, res) {
	const command = `npx sumo ${argsArray.join(" ")}`;
	console.log(`Eseguo: ${command} (cwd = ${SUMO_REPO_PATH})`);

	exec(command, { cwd: SUMO_REPO_PATH }, (error, stdout, stderr) => {
		if (error) {
			res.writeHead(500, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ error: stderr || error.message }));
		}

		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ output: stdout }));
	});
}

// Creazione del server e delle API
// localhost:3001/.../... -> Vedere i pathname sotto
const server = http.createServer((req, res) => {
	const url = parse(req.url, true);
	const method = req.method;

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (url.pathname === "/sumo/mutate") {
		// Disable
		// Enable di quelli che ti servono
		// Mutate
		// Invia al client
	}

	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not found" }));
});

// Avvio del Server
server.listen(PORT, () => {
	console.log(`Sumo server avviato su http://localhost:${PORT}`);
});
