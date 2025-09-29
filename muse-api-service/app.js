import express from "express";
import cors from "cors";
import { exec, spawn } from "node:child_process";
import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";
import { MuSeReportGenerator } from "../MuSe-Remix-Plugin/src/utils/generate_report.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATHS = {
	BASE: __dirname,
	MUSE_PROJECT: path.resolve(__dirname, "../MuSe"),
	PLUGIN_PROJECT: path.resolve(__dirname, "../remix-muse-ui"),

	MUSE: {
		SUMO_DIR: path.resolve(__dirname, "../MuSe/sumo"),
		CONTRACTS_DIR: path.resolve(__dirname, "../MuSe/contracts"),
		TESTS_DIR: path.resolve(__dirname, "../MuSe/test"),
		BUILD_DIR: path.resolve(__dirname, "../MuSe/build"),
		CONFIG_FILE: path.resolve(__dirname, "../MuSe/sumo-config.js"),
	},
	TEMPLATES: {
		DIR: path.resolve(__dirname, "../MuSe-Remix-Plugin/src/utils/templates"),
	},
	TEMP: path.resolve(__dirname, "./temp"),
	UTILS: {
		REPORT_GENERATOR: path.resolve(__dirname, "../Muse-Remix-Plugin/src/utils/generate_report.js"),
	},
};

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Funzione per eseguire "npx sumo ..."
export function runSumoCommand(command, parameters = []) {
	return new Promise((resolve, reject) => {
		switch (command) {
			case "disable": {
				const disableCMD = `npx sumo ${command}`;
				exec(disableCMD, { cwd: PATHS.MUSE_PROJECT }, (error, stdout, stderr) => {
					if (error) return reject(stderr || error.message);
					console.log(stdout);
					resolve(stdout);
				});
				break;
			}

			case "enable": {
				if (parameters.length === 0) return resolve("No operators to enable");
				const parametersConc = parameters.join(" ");
				const enableCMD = `npx sumo enable ${parametersConc}`;
				exec(enableCMD, { cwd: PATHS.MUSE_PROJECT }, (error, stdout, stderr) => {
					if (error) return reject(stderr || error.message);
					console.log(stdout);
					resolve(stdout);
				});
				break;
			}

			case "mutate": {
				const mutateCMD = `npx sumo mutate`;
				exec(mutateCMD, { cwd: PATHS.MUSE_PROJECT }, (error, stdout, stderr) => {
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

/**
 * Esegue "npx sumo test" in streaming (Linux-only) e chiama i callback ad ogni chunk.
 * Usa stdbuf per forzare il line-buffering e PYTHONUNBUFFERED per sbloccare l'I/O Python.
 */
function runSumoCommandStream(action, testingConfig, { cwd, onStdout, onStderr } = {}) {
	return new Promise((resolve, reject) => {
		// Linux fisso: forza line-buffer su stdout/stderr
		const child = spawn("bash", ["-lc", "stdbuf -oL -eL npx sumo test"], {
			cwd,
			env: { ...process.env, PYTHONUNBUFFERED: "1" },
			shell: false,
		});

		if (onStdout)
			child.stdout.on("data", (buf) => {
				try {
					onStdout(buf);
				} catch {}
			});
		if (onStderr)
			child.stderr.on("data", (buf) => {
				try {
					onStderr(buf);
				} catch {}
			});

		child.on("error", (err) => reject(err));
		child.on("close", (code) => resolve({ code }));
	});
}

export function copyTestConfig() {
	const templatesDir = PATHS.TEMPLATES.DIR;
	const destinationDir = PATHS.MUSE_PROJECT;

	fs.readdir(templatesDir, (err, files) => {
		if (err) {
			console.error("Errore nella lettura della cartella templates:", err);
			process.exit(1);
		}

		files.forEach((file) => {
			const srcPath = path.join(templatesDir, file);
			const destPath = path.join(destinationDir, file);

			if (fs.lstatSync(srcPath).isFile()) {
				fs.copyFile(srcPath, destPath, (err) => {
					if (!err) {
						console.log(`${file} copiato in MuSe`);
					}
				});
			}
		});
	});
}

export function getAllFiles(dirPath, arrayOfFiles = []) {
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

export function createFolders(dirs) {
	for (const dir of dirs) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}
}
export function clearFolders(dirs) {
	for (const dir of dirs) {
		if (fs.existsSync(dir)) {
			const files = fs.readdirSync(dir);
			for (const file of files) {
				const filePath = path.join(dir, file);
				fs.rmSync(filePath, { recursive: true, force: true });
			}
		}
	}
}

// API Routes
app.post("/api/save", (req, res) => {
	const dirs = [PATHS.MUSE.CONTRACTS_DIR, PATHS.MUSE.BUILD_DIR, PATHS.MUSE.TESTS_DIR];

	createFolders(dirs);
	// clearFolders(dirs);
	const contractsDir = PATHS.MUSE.CONTRACTS_DIR;
	if (fs.existsSync(contractsDir)) {
		const files = fs.readdirSync(contractsDir);
		for (const file of files) {
			const filePath = path.join(contractsDir, file);
			fs.rmSync(filePath, { recursive: true, force: true });
		}
	}

	const { filename, content } = req.body;

	if (!filename || !content) {
		return res.status(400).json({ error: "Missing filename or content" });
	}

	try {
		if (!fs.existsSync(PATHS.TEMP)) {
			fs.mkdirSync(PATHS.TEMP, { recursive: true });
		}

		const filePath = path.join(PATHS.MUSE.CONTRACTS_DIR, filename);
		fs.writeFileSync(filePath, typeof content === "string" ? content : JSON.stringify(content, null, 2));

		return res.json({ message: `File saved to ${filePath}` });
	} catch (err) {
		console.error("Errore durante il salvataggio del file:", err);
		return res.status(500).json({ error: err.message });
	}
});

app.post("/api/mutate", async (req, res) => {
	try {
		const mutators = req.body.mutators.map((m) => m.value);
		const dirs = [PATHS.MUSE.CONTRACTS_DIR, PATHS.MUSE.BUILD_DIR, PATHS.MUSE.TESTS_DIR];

		const dirs_to_clear = [PATHS.MUSE.BUILD_DIR, path.join(PATHS.MUSE.SUMO_DIR)];
		createFolders(dirs);
		clearFolders(dirs_to_clear);

		await runSumoCommand("disable");
		await runSumoCommand("enable", mutators);
		const output = await runSumoCommand("mutate");
		const mutantsDir = path.join(PATHS.MUSE.SUMO_DIR, "results/mutants");

		// Read the directory and filter only files
		const files = fs.readdirSync(mutantsDir).filter((file) => {
			const filePath = path.join(mutantsDir, file);
			return fs.statSync(filePath).isFile();
		});
		res.status(200).json({ output: files.length });
	} catch (err) {
		console.error("Errore durante la mutazione:", err);
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/test", async (req, res) => {
	// headers per streaming
	res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
	res.setHeader("Transfer-Encoding", "chunked");
	res.setHeader("Cache-Control", "no-cache");
	res.flushHeaders?.();

	const write = (obj) => res.write(JSON.stringify(obj) + "\n");

	// helper per righe (stdout/stderr possono arrivare “a pezzi”)
	const makeLineWriter = (type) => {
		let buffer = "";
		return (chunk) => {
			buffer += chunk.toString();
			let idx;
			while ((idx = buffer.indexOf("\n")) >= 0) {
				const line = buffer.slice(0, idx);
				buffer = buffer.slice(idx + 1);
				if (line.trim()) write({ type, line });
			}
		};
	};

	try {
		// 1) setup iniziale (come nel tuo codice)
		copyTestConfig();
		const dirs = [PATHS.MUSE.CONTRACTS_DIR, PATHS.MUSE.BUILD_DIR, PATHS.MUSE.TESTS_DIR];
		createFolders(dirs);
		clearFolders([PATHS.MUSE.TESTS_DIR]);

		const { testingConfig, testFiles } = req.body;

		// 2) salva i file test
		const testsDir = PATHS.MUSE.TESTS_DIR;
		if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
		for (const file of testFiles) {
			const filePath = path.join(testsDir, file.name);
			fs.writeFileSync(filePath, file.content);
		}

		// 3) aggiorna sumo-config.js
		const configPath = PATHS.MUSE.CONFIG_FILE;
		let content;
		try {
			content = fs.readFileSync(configPath, "utf-8");
		} catch (err) {
			write({ type: "error", message: "Unable to read sumo-config.js" });
			res.statusCode = 500;
			return res.end();
		}
		content = content.replace(/(testingFramework:\s*)["'][^"']*["']/, `$1"${testingConfig.testingFramework}"`);
		content = content.replace(/(testingTimeOutInSec:\s*)\d+/, `$1${testingConfig.testingTimeOutInSec}`);
		try {
			fs.writeFileSync(configPath, content, "utf-8");
			write({ type: "info", message: "sumo-config.js aggiornato" });
		} catch (err) {
			write({ type: "warn", message: "Errore nella scrittura di sumo-config.js" });
		}

		// 4) esegui sumo in streaming (Linux, unbuffered)
		//write({ type: "status", message: "Esecuzione test avviata" });
		const { code } = await runSumoCommandStream("test", testingConfig, {
			cwd: PATHS.MUSE_PROJECT,
			onStdout: makeLineWriter("log"),
			onStderr: makeLineWriter("error"),
		});

		// 5) genera report alla fine
		let reportContent = "";
		try {
			const generator = new MuSeReportGenerator();
			const reportPath = generator.generateReport();
			write({ type: "info", message: `Report generated at: ${reportPath}` });
			reportContent = fs.readFileSync(reportPath, "utf8");
		} catch (e) {
			write({ type: "warn", message: "Can't generate report" });
		}

		// 6) ultimo chunk + chiusura
		write({ type: "report", content: reportContent });
		//write({ type: "done", code });
		return res.end();
	} catch (err) {
		write({ type: "error", message: err?.message || String(err) });
		res.statusCode = 500;
		return res.end();
	}
});

app.get("/api/files-to-import", (req, res) => {
	try {
		const files = getAllFiles(PATHS.MUSE.SUMO_DIR)
			.filter((filePath) => !filePath.includes("baseline")) // elimina i file indesiderati
			.map((filePath) => {
				const content = fs.readFileSync(filePath, "utf8");
				const relativePath = path.relative(PATHS.MUSE.SUMO_DIR, filePath);
				return {
					path: `MuSe/${relativePath.replace(/\\/g, "/")}`,
					content,
				};
			});

		res.json(files);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get("/", (req, res) => {
	res.status(200).send("Server is running");
});

app.get("/error-for-test", (req, res) => {
	throw new Error("Test error");
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
	console.error("Server error:", err);
	res.status(500).json({ error: err.message || "Internal Server Error" });
});

export { app };
