import express from "express";
import cors from "cors";
import { exec } from "child_process";
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
		const npmNpxPath = path.join(process.env.HOME || "/root", ".npm/_npx");
		if (fs.existsSync(npmNpxPath)) {
			fs.rmSync(npmNpxPath, { recursive: true, force: true });
		}

		switch (command) {
			case "disable": {
				// const sumoDir = PATHS.MUSE.SUMO_DIR;
				// if (fs.existsSync(sumoDir)) {
				// 	const files = fs.readdirSync(sumoDir);
				// 	for (const file of files) {
				// 		const filePath = path.join(sumoDir, file);
				// 		fs.rmSync(filePath, { recursive: true, force: true });
				// 	}
				// }
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

			case "test": {
				const testCMD = `npx sumo test`;
				exec(testCMD, { cwd: PATHS.MUSE_PROJECT }, (error, stdout, stderr) => {
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

// API Routes
app.post("/api/save", (req, res) => {
	const dirs = [PATHS.MUSE.CONTRACTS_DIR, PATHS.MUSE.BUILD_DIR, PATHS.MUSE.TESTS_DIR];

	for (const dir of dirs) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}

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

		await runSumoCommand("disable");
		await runSumoCommand("enable", mutators);
		const output = await runSumoCommand("mutate");
		const mutantsDir = path.join(PATHS.MUSE.SUMO_DIR, "results/mutants");

		// Read the directory and filter only files
		const files = fs.readdirSync(mutantsDir).filter((file) => {
			const filePath = path.join(mutantsDir, file);
			return fs.statSync(filePath).isFile();
		});
		res.json({ output: files.length });
	} catch (err) {
		console.error("Errore durante la mutazione:", err.message);
		res.status(500).json({ error: err.message });
	}
});

app.post("/api/test", async (req, res) => {
	try {
		copyTestConfig();

		const { testingConfig, testFiles } = req.body;

		// Salva i file nella cartella tests
		const testsDir = PATHS.MUSE.TESTS_DIR;
		if (!fs.existsSync(testsDir)) {
			fs.mkdirSync(testsDir, { recursive: true });
		}

		for (const file of testFiles) {
			const filePath = path.join(testsDir, file.name);
			fs.writeFileSync(filePath, file.content);
		}

		const configPath = PATHS.MUSE.CONFIG_FILE;
		let content;
		try {
			content = fs.readFileSync(configPath, "utf-8");
		} catch (err) {
			console.error("Errore nella lettura di sumo-config.js:", err);
			return res.status(500).json({ error: "Unable to read sumo-config.js" });
		}

		content = content.replace(/(testingFramework:\s*)["'][^"']*["']/, `$1"${testingConfig.testingFramework}"`);
		content = content.replace(/(testingTimeOutInSec:\s*)\d+/, `$1${testingConfig.testingTimeOutInSec}`);

		try {
			fs.writeFileSync(configPath, content, "utf-8");
			console.log("sumo-config.js aggiornato");
		} catch (err) {
			console.error("Errore nella scrittura del file:", err);
		}

		// Esegui il comando di testing
		const output = await runSumoCommand("test", testingConfig);
		const last10Lines = output.split("\n").slice(-10).join("\n");

		// Generate report
		const generator = new MuSeReportGenerator();
		const reportPath = generator.generateReport();
		console.log(`Report generated at: ${reportPath}`);
		const reportContent = fs.readFileSync(reportPath, "utf8");C

		res.json({ output: last10Lines || "OK", report: reportContent });
	} catch (err) {
		console.error("Errore durante il testing:", err.message || err);
		res.status(500).json({ error: err.message });
	}
});

app.get("/api/files-to-import", (req, res) => {
	try {
		const sumoDir = PATHS.MUSE.SUMO_DIR;
		const files = getAllFiles(sumoDir).map((filePath) => {
			const content = fs.readFileSync(filePath, "utf8");
			const relativePath = path.relative(sumoDir, filePath);
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
