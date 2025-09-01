import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("fs", () => ({
	readdirSync: jest.fn(),
	readFileSync: jest.fn(),
	statSync: jest.fn(),
}));

const { app } = await import("../app.js");
const fs = await import("fs");

describe("GET /api/files-to-import", () => {
	beforeEach(() => jest.clearAllMocks());

	it("should return list of files", async () => {
		fs.readdirSync.mockReturnValue(["file1.sol"]);
		fs.statSync.mockReturnValue({ isDirectory: () => false });
		fs.readFileSync.mockReturnValue("contract test {}");

		const res = await request(app).get("/api/files-to-import");

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	it("should handle error", async () => {
		fs.readdirSync.mockImplementation(() => {
			throw new Error("fail");
		});

		const res = await request(app).get("/api/files-to-import");

		expect(res.status).toBe(500);
		expect(res.body.error).toBe("fail");
	});
});
