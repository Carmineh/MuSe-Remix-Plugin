import https from "https";
import { exec } from "child_process";
import { parse } from "url";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Percorsi assoluti
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUMO_REPO_PATH = path.resolve(__dirname, "../MuSe/");
const PORT = 3001;

// Funzione per eseguire "npx sumo ..."
function runSumoCommand(command, parameters = []) {
	return new Promise((resolve, reject) => {
		switch (command) {
			case "disable": {
				const sumoDir = path.join(SUMO_REPO_PATH, "sumo");
				if (fs.existsSync(sumoDir)) {
					const files = fs.readdirSync(sumoDir);
					for (const file of files) {
						const filePath = path.join(sumoDir, file);
						fs.rmSync(filePath, { recursive: true, force: true });
					}
				}

				const disableCMD = `npx sumo ${command}`;
				exec(disableCMD, { cwd: SUMO_REPO_PATH }, (error, stdout, stderr) => {
					if (error) return reject(stderr || error.message);
					console.log(stdout);
					resolve(stdout);
				});
				break;
			}

			case "enable": {
				if (parameters.length === 0) return resolve("No operators to enable");

				let promises = parameters.map((element) => {
					return new Promise((res, rej) => {
						const enableCMD = `npx sumo enable ${element}`;
						exec(enableCMD, { cwd: SUMO_REPO_PATH }, (error, stdout, stderr) => {
							if (error) return rej(stderr || error.message);
							console.log(stdout);
							res(stdout);
						});
					});
				});

				Promise.all(promises).then(resolve).catch(reject);
				break;
			}

			case "mutate": {
				const mutateCMD = `npx sumo mutate`;
				exec(mutateCMD, { cwd: SUMO_REPO_PATH }, (error, stdout, stderr) => {
					if (error) return reject(stderr || error.message);
					console.log(stdout);
					resolve(stdout);
				});
				break;
			}

			default:
				reject("NO COMMAND FOUND");
		}
	});
}

// Server HTTP
const server = https.createServer((req, res) => {
	const url = parse(req.url, true);
	const method = req.method;

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (method === "OPTIONS") {
		res.writeHead(204);
		return res.end();
	}

	if (url.pathname === "/api/save" && method === "POST") {
		const sumoDir = path.join(SUMO_REPO_PATH, "contracts");
		if (fs.existsSync(sumoDir)) {
			const files = fs.readdirSync(sumoDir);
			for (const file of files) {
				const filePath = path.join(sumoDir, file);
				fs.rmSync(filePath, { recursive: true, force: true });
			}
		}
		let body = "";

		req.on("data", (chunk) => {
			body += chunk.toString();
		});

		req.on("end", () => {
			let parsed;
			try {
				parsed = JSON.parse(body);
			} catch (e) {
				console.error("Errore nel parsing del JSON:", e.message, body);
				res.writeHead(400, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: "Invalid JSON format" }));
			}

			const { filename, content } = parsed;

			if (!filename || !content) {
				res.writeHead(400, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: "Missing filename or content" }));
			}

			try {
				const targetDir = path.join(__dirname, "temp");
				if (!fs.existsSync(targetDir)) {
					fs.mkdirSync(targetDir);
				}

				const filePath = path.join("../MuSe/contracts/" + filename);
				fs.writeFileSync(filePath, typeof content === "string" ? content : JSON.stringify(content, null, 2));
				res.writeHead(200, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ message: `File saved to ${filePath}` }));
			} catch (err) {
				console.error("Errore durante il salvataggio del file:", err);
				res.writeHead(500, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: err.message }));
			}
		});
		return;
	}

	if (url.pathname === "/api/mutate" && method === "POST") {
		let body = "";

		req.on("data", (chunk) => {
			body += chunk.toString();
		});

		req.on("end", async () => {
			let parsed;
			try {
				parsed = JSON.parse(body);
			} catch (e) {
				console.error("Errore nel parsing del JSON:", e.message);
				res.writeHead(400, { "Content-Type": "application/json" });
				return res.end(JSON.stringify({ error: "Invalid JSON format" }));
			}

			const mutators = parsed.mutators.map((m) => m.value);

			try {
				await runSumoCommand("disable");
				await runSumoCommand("enable", mutators);
				const output = await runSumoCommand("mutate");

				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ output: output || "OK" }));
			} catch (err) {
				console.error("Errore durante la mutazione:", err.message);
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: err.message }));
			}
		});
		return;
	}

	if (url.pathname === "/api/files-to-import" && method === "GET") {
		const sumoDir = path.join(__dirname, "../MuSe/sumo");
		const files = getAllFiles(sumoDir).map((filePath) => {
			const content = fs.readFileSync(filePath, "utf8");
			const relativePath = path.relative(sumoDir, filePath);
			return {
				path: `MuSe/${relativePath.replace(/\\/g, "/")}`,
				content,
			};
		});

		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(files));
		return;
	}

	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not found" }));
});

function getAllFiles(dirPath, arrayOfFiles = []) {
	const files = fs.readdirSync(dirPath);
	files.forEach((file) => {
		const fullPath = path.join(dirPath, file);
		if (fs.statSync(fullPath).isDirectory()) {
			getAllFiles(fullPath, arrayOfFiles);
		} else {
			arrayOfFiles.push(fullPath);
		}
	});
	return arrayOfFiles;
}

// Avvio server
server.listen(PORT, () => {
	console.log(`Sumo server avviato su https://localhost:${PORT}`);
});
