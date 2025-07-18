import http from "http";
import { exec } from "child_process";
import { parse } from "url";
import { fileURLToPath } from "url";
import path from "path";

// Simula __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calcola path assoluto verso la repo MuSe
const SUMO_REPO_PATH = path.resolve(__dirname, "../MuSe");

// Porta su cui ascolta il server
const PORT = 3001;

// Helper per eseguire npx sumo da dentro la repo MuSe
function runSumoCommand(argsArray, res) {
	const command = `npx sumo ${argsArray.join(" ")}`;
	console.log(`▶️ Eseguo: ${command} (cwd = ${SUMO_REPO_PATH})`);

	exec(command, { cwd: SUMO_REPO_PATH }, (error, stdout, stderr) => {
		if (error) {
			res.writeHead(500, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ error: stderr || error.message }));
		}

		// Se è il comando `list`, filtriamo solo i codici
		if (argsArray[0] === "list") {
			// Match di tutto ciò tra "> " e " ("
			const matches = [...stdout.matchAll(/> ([A-Z0-9]+) \(/g)].map((m) => m[1]);
			res.writeHead(200, { "Content-Type": "application/json" });
			return res.end(JSON.stringify({ enabled: matches }));
		}

		// Altrimenti, ritorna output completo
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ output: stdout }));
	});
}

// Crea un semplice server HTTP
const server = http.createServer((req, res) => {
	const url = parse(req.url, true);
	const method = req.method;

	// CORS manuale
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (method === "OPTIONS") {
		res.writeHead(204);
		return res.end();
	}

	if (url.pathname === "/sumo/list" && method === "GET") {
		return runSumoCommand(["list"], res);
	}

	if (url.pathname === "/sumo/enable" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			const { mutator } = JSON.parse(body || "{}");
			const args = mutator ? ["enable", mutator] : ["enable"];
			runSumoCommand(args, res);
		});
		return;
	}

	if (url.pathname === "/sumo/disable" && method === "POST") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => {
			const { mutator } = JSON.parse(body || "{}");
			const args = mutator ? ["disable", mutator] : ["disable"];
			runSumoCommand(args, res);
		});
		return;
	}

	if (url.pathname === "/sumo/mutate") {
		return runSumoCommand(["mutate"], res);
	}

	// 404 fallback
	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not found" }));
});

// Avvia il server
server.listen(PORT, () => {
	console.log(`✅ Sumo server avviato su http://localhost:${PORT}`);
});
