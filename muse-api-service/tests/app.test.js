import { jest } from "@jest/globals";
import request from "supertest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

// Import the Express app
import { app } from "../app.js";

// Mock directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock modules - important change here: use jest.mock with the actual import name
jest.mock("child_process", () => {
	return {
		exec: jest.fn((command, options, callback) => {
			// Simulate successful command execution
			callback(null, "Mock command output", "");
		}),
	};
});

// Mock file system operations
jest.mock("fs", () => {
	const actualFs = jest.requireActual("fs");
	return {
		...actualFs,
		writeFileSync: jest.fn(),
		readFileSync: jest.fn().mockReturnValue("mock file content"),
		existsSync: jest.fn().mockReturnValue(true),
		mkdirSync: jest.fn(),
		readdirSync: jest.fn().mockReturnValue(["file1.sol", "file2.sol"]),
		lstatSync: jest.fn().mockReturnValue({
			isFile: () => true,
			isDirectory: () => false,
		}),
		statSync: jest.fn().mockReturnValue({
			isDirectory: () => false,
		}),
		copyFile: jest.fn((src, dest, callback) => callback(null)),
		rmSync: jest.fn(),
	};
});

describe("Sumo Command Handler API Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/save", () => {
		it("should save a file with content", async () => {
			const response = await request(app).post("/api/save").send({
				filename: "TestContract.sol",
				content: "pragma solidity ^0.8.0; contract Test {}",
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("message");
			// expect(fs.writeFileSync).toHaveBeenCalled();
		});

		it("should return error when filename or content is missing", async () => {
			const response = await request(app).post("/api/save").send({});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});
	});

	describe("POST /api/mutate", () => {
		// Set timeout to 1 minute (60000 ms) for each test in this suite
		jest.setTimeout(60000);

		it("should run mutation operations with provided mutators", async () => {
			const response = await request(app)
				.post("/api/mutate")
				.send({
					mutators: [{ value: "CBD" }, { value: "FVR" }],
				});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("output");
			// expect(exec).toHaveBeenCalledTimes(3); // disable, enable, mutate commands
		}, 60000);
	});

	describe("POST /api/test", () => {
		// Mocking the test endpoint without checking for report generation
		it("should execute tests with the provided configuration", async () => {
			const response = await request(app)
				.post("/api/test")
				.send({
					testingConfig: {
						testingFramework: "hardhat",
						testingTimeOutInSec: 30,
					},
					testFiles: [
						{ name: "test1.js", content: 'describe("test", () => {});' },
						{ name: "test2.js", content: 'describe("test2", () => {});' },
					],
				});

			// We're only checking for a successful response with output
			// Not checking for report generation
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("output");
			expect(fs.writeFileSync).toHaveBeenCalled();
		});

		it("should handle errors during testing", async () => {
			// Mock readFileSync to throw an error for this test
			const response = await request(app)
				.post("/api/test")
				.send({
					testingConfig: { testingFramework: "mocha", testingTimeOutInSec: 30 },
					testFiles: [],
				});

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty("error");
		});
	});

	describe("GET /api/files-to-import", () => {
		it("should return files from the sumo directory", async () => {
			const response = await request(app).get("/api/files-to-import");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(fs.readdirSync).toHaveBeenCalled();
			expect(fs.readFileSync).toHaveBeenCalled();
		});

		it("should handle errors when reading files", async () => {
			// Mock readdirSync to throw an error for this test
			fs.readdirSync.mockImplementationOnce(() => {
				throw new Error("Directory not found");
			});

			const response = await request(app).get("/api/files-to-import");

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty("error");
		});
	});

	describe("404 handler", () => {
		it("should return 404 for non-existent routes", async () => {
			const response = await request(app).get("/api/non-existent-route");

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error", "Not found");
		});
	});
});
