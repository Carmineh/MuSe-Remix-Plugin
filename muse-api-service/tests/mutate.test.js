import request from "supertest";
import { afterAll, beforeAll, jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";

const { app } = await import("../app.js");

describe("POST /api/mutate", () => {
	const contractFile = "./tests/test-contracts/Simple.sol";
	const contractDir = "../MuSe/contracts"; // Dove andremo a copiare il file

	beforeAll(async () => {
		jest.clearAllMocks();
		await fs.mkdir(contractDir, { recursive: true }); // Assicura che la cartella esista
		await fs.copyFile(contractFile, path.join(contractDir, "Simple.sol"));
	});

	afterAll(async () => {
		try {
			await fs.unlink(path.join(contractDir, "Simple.sol"));
		} catch (err) {
			if (err.code !== "ENOENT") throw err; // ignora se il file non esiste
		}
	});

	it("should return success after mutation", async () => {
		const res = await request(app)
			.post("/api/mutate")
			.send({
				mutators: [{ value: "VVR" }],
			});
		expect(res.status).toBe(200);
	}, 10000);

	it("should return error for missing mutators", async () => {
		const res = await request(app).post("/api/mutate").send({});
		expect(res.status).toBe(500);
		// expect(res.body.error).toBe("Mutators are required");
	}, 10000);
});
