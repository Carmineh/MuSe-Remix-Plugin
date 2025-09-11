import request from "supertest";
import { jest, beforeAll, beforeEach, afterAll } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock del report generator
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

describe("POST /api/test", () => {
    // Pulizia e preparazione cartelle prima di tutti i test
    beforeAll(async () => {
        jest.clearAllMocks();

        await fs.mkdir(CONTRACT_DIR, { recursive: true });
        await fs.mkdir(TEST_DIR, { recursive: true });

        try {
            await fs.copyFile(CONTRACT_FILE, path.join(CONTRACT_DIR, "Simple.sol"));
        } catch (err) {
            console.error("Contratto mancante:", CONTRACT_FILE);
            throw err;
        }

        // Copia file di test
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

    // Pulizia dopo tutti i test
    afterAll(async () => {
        try {
            //await fs.unlink(path.join(CONTRACT_DIR, "Simple.sol"));
        } catch (err) {
            console.error("Errore pulizia cartelle di test:", err);
        }
    });

    it("Sumo Mutation test golden file", async () => {
        // Costruzione array di oggetti { name, content } per la richiesta
        const testFilesNames = await fs.readdir(TEST_FILE_DIR);
        const testFiles = [];
        for (const f of testFilesNames) {
            const content = await fs.readFile(path.join(TEST_FILE_DIR, f), "utf8");
            testFiles.push({ name: f, content });
        }

        await request(app)
            .post("/api/mutate")
            .send({
                mutators: [{ value: "TX" }],
            });

        const res = await request(app)
            .post("/api/test")
            .send({
                testingConfig: { testingFramework: "brownie", testingTimeOutInSec: 300 },
                testFiles,
            });

        expect(res.status).toBe(200);
        expect(res.body.output).toBeDefined();

        // Read and compare reports
        const generatedReport = await fs.readFile(
            path.resolve("../MuSe/sumo/results/sumo-log.txt"),
            "utf8"
        );

        const expectedReport = await fs.readFile(
            path.resolve("./tests/utils/expected-sumo-log.txt"),
            "utf8"
        );

        // Funzione per rimuovere le righe con i tempi
        const cleanReport = (report) => {
            return report
                .split('\n')
                .filter(line => !line.includes('seconds') && !line.includes('minutes'))
                .join('\n')
                .trim();
        };
        expect(cleanReport(generatedReport)).toBe(cleanReport(expectedReport));
    }, 1000000); // timeout lungo
});
