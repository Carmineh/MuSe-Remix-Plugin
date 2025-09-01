import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("fs", () => ({
	existsSync: jest.fn(),
	mkdirSync: jest.fn(),
	readdirSync: jest.fn(),
	rmSync: jest.fn(),
	writeFileSync: jest.fn(),
}));

const { app } = await import("../app.js");
const fs = await import("fs");

describe("POST /api/save", () => {
	beforeEach(() => jest.clearAllMocks());

	it("should save file successfully", async () => {
		fs.existsSync.mockReturnValue(true);
		fs.readdirSync.mockReturnValue([]);
		const res = await request(app).post("/api/save").send({
			filename: "test.sol",
			content: "pragma solidity",
		});
		expect(res.status).toBe(200);
		expect(res.body.message).toMatch(/File saved/);
	});

	it("should return error for missing data", async () => {
		const res = await request(app).post("/api/save").send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/Missing filename/);
	});
});
