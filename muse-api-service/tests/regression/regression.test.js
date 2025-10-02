import request from "supertest";
import { jest, beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock del report generator (non indispensabile qui, ma innocuo)
jest.unstable_mockModule("../../../MuSe-Remix-Plugin/src/utils/generate_report.js", () => ({
	MuSeReportGenerator: jest.fn().mockImplementation(() => ({
		generateReport: jest.fn(() => path.resolve(__dirname, "fake-report.txt")),
	})),
}));

const { app } = await import("../../app.js");

// Percorsi principali dei test e dei contratti
const MAIN_DIR = path.resolve("./tests/utils");
const CONTRACT_FILE = path.join(MAIN_DIR, "contracts", "Simple.sol");
const TEST_FILE_DIR = path.join(MAIN_DIR, "tests");
const CONTRACT_DIR = path.resolve("../MuSe/contracts"); // destinazione contratti
const TEST_DIR = path.resolve("../MuSe/test"); // destinazione test files

describe("POST /api/test (golden file, NDJSON)", () => {
	beforeAll(async () => {
		jest.clearAllMocks();

		await fs.mkdir(CONTRACT_DIR, { recursive: true });
		await fs.mkdir(TEST_DIR, { recursive: true });

		// copia contratto
		await fs.copyFile(CONTRACT_FILE, path.join(CONTRACT_DIR, "Simple.sol")).catch((err) => {
			console.error("Contratto mancante:", CONTRACT_FILE);
			throw err;
		});

		// semina i test file (non strettamente necessario perché li inviamo nel body, ma coerente)
		try {
			const testFilesNames = await fs.readdir(TEST_FILE_DIR);
			for (const f of testFilesNames) {
				const content = await fs.readFile(path.join(TEST_FILE_DIR, f), "utf8");
				await fs.writeFile(path.join(TEST_DIR, f), content);
			}
		} catch (err) {
			console.error("Errore nella copia dei test files:", err);
		}

		// fake report per il mock (se mai usato)
		const fakeReportPath = path.resolve(__dirname, "fake-report.txt");
		await fs.writeFile(fakeReportPath, "contenuto fittizio del report", "utf8");
	});

	afterAll(async () => {
		// eventuale cleanup
	});

	it("Sumo Mutation test golden file", async () => {
		// Prepara i test file da inviare
		const testFilesNames = await fs.readdir(TEST_FILE_DIR);
		const testFiles = [];
		for (const f of testFilesNames) {
			const content = await fs.readFile(path.join(TEST_FILE_DIR, f), "utf8");
			testFiles.push({ name: f, content });
		}

		// 1) abilita mutator e genera i mutanti
		await request(app)
			.post("/api/mutate")
			.send({ mutators: [{ value: "TX" }] })
			.expect(200);

		// 2) chiama /api/test e accumula lo stream NDJSON
		const ndjsonText = await new Promise((resolve, reject) => {
			const req = request(app)
				.post("/api/test")
				.send({
					testingConfig: { testingFramework: "brownie", testingTimeOutInSec: 300 },
					testFiles,
				});

			let data = "";
			req.on("response", (res) => {
				if (res.status !== 200) {
					return reject(new Error(`Unexpected status: ${res.status}`));
				}
				res.setEncoding("utf8");
				res.on("data", (chunk) => {
					data += chunk;
				});
				res.on("end", () => {
					resolve(data);
				});
				res.on("error", (err) => {
					reject(err);
				});
			});

			req.end();
		});

		// 3) parse NDJSON → array di eventi
		const events = (ndjsonText || "")
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean)
			.map((l) => {
				try {
					return JSON.parse(l);
				} catch {
					return { type: "raw", line: l };
				}
			});

		// deve esserci un "done" finale
		const doneEvt = events.find((e) => e.type === "done");
		expect(doneEvt).toBeDefined();

		// 4) confronta il “sumo-log.txt” generato con l’expected
		const generatedReport = await fs.readFile(path.resolve("../MuSe/sumo/results/sumo-log.txt"), "utf8");
		const expectedReport = await fs.readFile(path.resolve("./tests/utils/expected-sumo-log.txt"), "utf8");

		// rimuovi righe con tempi e trailing spaces per confronto robusto
		const cleanReport = (report) =>
			String(report || "")
				.split("\n")
				.filter((line) => !line.includes("seconds") && !line.includes("minutes"))
				.map((line) => line.trimEnd())
				.join("\n")
				.trim();

		expect(cleanReport(generatedReport)).toBe(cleanReport(expectedReport));
	}, 1000000); // timeout lungo
});
