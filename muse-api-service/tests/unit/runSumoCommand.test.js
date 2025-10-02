import { jest } from "@jest/globals";

// Since ES module mocking is problematic, let's test the actual behavior
// but validate that the function works correctly with real commands

describe("[runSumoCommand] Command execution with parameters", () => {
	let runSumoCommand;

	beforeAll(async () => {
		// Import the function
		const module = await import("../../app.js");
		runSumoCommand = module.runSumoCommand;
	});

	it("[TC-U_3.1] Execution of command disable", async () => {
		const output = await runSumoCommand("disable");

		// Validate that the output contains the expected message
		expect(typeof output).toBe("string");
		expect(output).toContain("All mutation operators disabled");
	}, 30000);

	it("[TC-U_3.2] Execution of command enable with parameters", async () => {
		const output = await runSumoCommand("enable", ["BOR"]);

		// Validate that the output contains the expected message
		expect(typeof output).toBe("string");
		expect(output).toContain("BOR enabled");
	}, 30000);

	it("[TC-U_3.3] Execution of command enable without parameters (no operators)", async () => {
		const output = await runSumoCommand("enable");

		// This should return the early response
		expect(output).toBe("No operators to enable");
	}, 30000);

	it("[TC-U_3.4] Execution of command mutate", async () => {
		const output = await runSumoCommand("mutate");

		// Validate that the output contains expected content
		expect(typeof output).toBe("string");
		expect(output).toContain("Checking project configuration");
		expect(output).toContain("Contracts directory");
		expect(output).toContain("Test directory");
		expect(output).toContain("Build directory");
	}, 30000);

	it("[TC-U_3.5] Command not recognized [Error]", async () => {
		await expect(runSumoCommand("unknown")).rejects.toEqual("NO COMMAND FOUND");
	}, 30000);
});
