// tests/unit/runSumoCommand.test.js
import { jest } from "@jest/globals";

// 1. Mock del modulo PRIMA di importare ciò che lo usa
jest.unstable_mockModule("child_process", () => ({
	exec: jest.fn(),
}));

// 2. Ora importiamo runSumoCommand e il mock
const { runSumoCommand } = await import("../../app.js");
const { exec } = await import("child_process");

describe("runSumoCommand", () => {
	it("esegue comando disable", async () => {
		exec.mockImplementation((cmd, opts, cb) => cb(null, "ok", ""));

		const output = await runSumoCommand("disable");

		expect(output).toBe("ok");
		expect(exec).toHaveBeenCalledWith(
			expect.stringContaining("npx sumo disable"),
			expect.any(Object),
			expect.any(Function)
		);
	});
});
