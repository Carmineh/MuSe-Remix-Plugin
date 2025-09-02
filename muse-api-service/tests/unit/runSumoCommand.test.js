// tests/unit/runSumoCommand.test.js
import { jest } from "@jest/globals";

// 1. Mock del modulo PRIMA di importare ciò che lo usa
jest.unstable_mockModule("child_process", () => ({
	exec: jest.fn(),
}));

// 2. Ora importiamo runSumoCommand e il mock
const { runSumoCommand } = await import("../../app.js");
const { exec } = await import("child_process");

describe("[runSumoCommand] Command execution with parameters", () => {
	it("[runSumoCommand] Executes disable command", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(null, "ok", ""));

		const output = await runSumoCommand("disable");

		expect(output).toBe("ok");
		expect(exec).toHaveBeenCalledWith(
			expect.stringContaining("npx sumo disable"),
			expect.any(Object),
			expect.any(Function)
		);
	});

	it("[runSumoCommand] Executes enable command", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(null, "ok", ""));

		const output = await runSumoCommand("enable", ["BOR"]);

		expect(output).toBe("ok");
		expect(exec).toHaveBeenCalledWith(
			expect.stringContaining("npx sumo enable"),
			expect.any(Object),
			expect.any(Function)
		);
	});

	it("[runSumoCommand] Executes enable without operators", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(null, "No operators to enable", ""));

		const output = await runSumoCommand("enable");

		expect(output).toBe("No operators to enable");
		expect(exec).toHaveBeenCalledWith(
			expect.stringContaining("npx sumo enable"),
			expect.any(Object),
			expect.any(Function)
		);
	});

	it("[runSumoCommand] Executes mutate command", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(null, "ok", ""));

		const output = await runSumoCommand("mutate");

		expect(output).toBe("ok");
		expect(exec).toHaveBeenCalledWith(
			expect.stringContaining("npx sumo mutate"),
			expect.any(Object),
			expect.any(Function)
		);
	});

	it("[runSumoCommand] Handles execution error", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(new Error("fail"), null, ""));

		await expect(runSumoCommand("disable")).rejects.toEqual("fail");
	});
});
