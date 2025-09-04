import request from "supertest";
import { afterAll, beforeAll, jest } from "@jest/globals";
import fs from "fs/promises";
import path from "path";

const { app } = await import("../app.js");

describe("POST /api/mutate", () => {
	const contractFile = "./tests/utils/contracts/Simple.sol";
	const contractDir = "../MuSe/contracts";

	beforeAll(async () => {
		jest.clearAllMocks();
		await fs.mkdir(contractDir, { recursive: true });
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
	}, 1000000);

	it("should return error for missing mutators", async () => {
		const res = await request(app).post("/api/mutate").send({});
		expect(res.status).toBe(500);
		// expect(res.body.error).toBe("Mutators are required");
	}, 1000000);
});
