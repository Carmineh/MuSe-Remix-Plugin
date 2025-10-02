import request from "supertest";
import { jest, beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock del report generator: restituisce un path noto che creiamo noi
jest.unstable_mockModule("../../MuSe-Remix-Plugin/src/utils/generate_report.js", () => ({
	MuSeReportGenerator: jest.fn().mockImplementation(() => ({
		generateReport: jest.fn(() => path.resolve(__dirname, "fake-report.txt")),
	})),
}));

const { app } = await import("../app.js");

// Percorsi principali dei test e dei contratti
const MAIN_DIR = path.resolve("./tests/utils");
const CONTRACT_FILE = path.join(MAIN_DIR, "contracts", "Simple.sol");
const TEST_FILE_DIR = path.join(MAIN_DIR, "tests");
const CONTRACT_DIR = path.resolve("../MuSe/contracts"); // destinazione contratti
const TEST_DIR = path.resolve("../MuSe/test"); // destinazione test files

describe("POST /api/test (NDJSON streaming)", () => {
	beforeAll(async () => {
		jest.clearAllMocks();

		await fs.mkdir(CONTRACT_DIR, { recursive: true });
		await fs.mkdir(TEST_DIR, { recursive: true });

		// file di report fittizio usato dal mock
		const fakeReportPath = path.resolve(__dirname, "fake-report.txt");
		await fs.writeFile(fakeReportPath, "contenuto fittizio del report", "utf8");

		// Copia contratto
		await fs.copyFile(CONTRACT_FILE, path.join(CONTRACT_DIR, "Simple.sol")).catch((err) => {
			console.error("Contratto mancante:", CONTRACT_FILE);
			throw err;
		});

		// Copia file di test “seed” nella cartella MuSe/test (non strettamente necessario per la chiamata a /api/test,
		// dato che invieremo i file via body, ma resta coerente con il vecchio setup)
		try {
			const testFilesNames = await fs.readdir(TEST_FILE_DIR);
			for (const f of testFilesNames) {
				const content = await fs.readFile(path.join(TEST_FILE_DIR, f), "utf8");
				await fs.writeFile(path.join(TEST_DIR, f), content);
			}
		} catch (err) {
			console.error("Errore nella copia dei test files:", err);
		}
	});

	afterAll(async () => {
		// eventuale cleanup se serve
	});

	it("Sumo Mutation test of an example contract (stream NDJSON)", async () => {
		// Prepara i test file da inviare al backend (come prima)
		const testFilesNames = await fs.readdir(TEST_FILE_DIR);
		const testFiles = [];
		for (const f of testFilesNames) {
			const content = await fs.readFile(path.join(TEST_FILE_DIR, f), "utf8");
			testFiles.push({ name: f, content });
		}

		// 1) abilita mutator e genera i mutanti (API rimasta JSON)
		await request(app)
			.post("/api/mutate")
			.send({ mutators: [{ value: "TX" }] })
			.expect(200);

		// 2) avvia /api/test e leggi TUTTO lo stream NDJSON (accumulo + parse)
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
					// se arriva qualche riga non-JSON, trasformala in evento grezzo
					return { type: "raw", line: l };
				}
			});

		// 4) asserzioni minime sugli eventi chiave
		// evento iniziale "status"
		const hasStatus = events.some((e) => e.type === "status" && /Esecuzione test avviata/i.test(e.message || ""));
		expect(hasStatus).toBe(true);

		// deve arrivare un "report" con contenuto (mock)
		const reportEvt = events.find((e) => e.type === "report");
		expect(reportEvt).toBeDefined();
		expect(reportEvt.content).toContain("contenuto fittizio del report");

		// deve arrivare "done" finale con un code numerico o null (a seconda dell'ambiente)
		const doneEvt = events.find((e) => e.type === "done");
		expect(doneEvt).toBeDefined();

		// opzionale: verifica che tra i log ci sia almeno una riga "Mutation X of Y"
		const hasMutationLine = events.some((e) => e.type === "log" && /\bMutation\s+\d+\s+of\s+\d+\b/.test(e.line || ""));
		expect(hasMutationLine).toBe(true);
	}, 1000000); // timeout lungo
});
