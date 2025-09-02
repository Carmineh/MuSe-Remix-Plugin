import { renderHook, act } from "@testing-library/react";
import { useRemixClient } from "../useRemixClient";
import { createClient } from "@remixproject/plugin-iframe";

jest.mock("@remixproject/plugin-iframe");

const API_URL = "http://localhost:3001";

function advanceAllTimers() {
	jest.runOnlyPendingTimers();
}

describe("useRemixClient", () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test("inizializzazione: carica i contratti", async () => {
		const mockContracts = {
			"contracts/Token.sol": { isDirectory: false },
			"contracts/Lib.sol": { isDirectory: false },
			"contracts/subdir": { isDirectory: true },
		};

		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.contracts).toEqual(["Token.sol", "Lib.sol"]);
		expect(result.current.consoleMessages.some((m) => m.includes("Loaded 2 contracts."))).toBe(true);
	});

	test("inizializzazione: nessun contratto trovato", async () => {
		const mockContracts = {};
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		expect(result.current.contracts).toEqual([]);
		expect(result.current.consoleMessages.some((m) => m.includes("No contracts found in contracts folder."))).toBe(
			true
		);
	});

	test("executeMutations: messaggio se nessun contratto selezionato", async () => {
		const mockContracts = {};
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		await act(async () => {
			await result.current.executeMutations(["AOR"]);
		});

		expect(result.current.consoleMessages.some((m) => m.includes("Please select a contract first."))).toBe(true);
	});

	test("executeMutations: messaggio se nessun mutator selezionato", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		act(() => {
			result.current.setSelectedContract("contracts/Token.sol");
		});

		await act(async () => {
			await result.current.executeMutations([]);
		});

		expect(
			result.current.consoleMessages.some((m) => m.includes("Please select at least one mutation operator."))
		).toBe(true);
	});

	test("executeMutations: flusso completo successo", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.readFile.mockResolvedValueOnce("pragma solidity ^0.8.0; contract Token {}");
		client.fileManager.writeFile.mockResolvedValue();

		// Mock API calls
		global.fetch = jest
			.fn()
			.mockImplementation(async () => ({
				ok: true,
				json: async () => ({ status: "saved" }),
			}))
			.mockImplementation(async () => ({
				ok: true,
				json: async () => ({ output: 3, message: "Mutants generated" }),
			}))
			.mockImplementation(async () => ({
				ok: true,
				json: async () => [
					{ path: "/MuSe/mutants/m1.sol", content: "contract M1 {}" },
					{ path: "/MuSe/mutants/m2.sol", content: "contract M2 {}" },
				],
			}));

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		act(() => {
			result.current.setSelectedContract("contracts/Token.sol");
		});

		await act(async () => {
			await result.current.executeMutations(["AOR", "ROR"]);
		});

		const msgs = result.current.consoleMessages.join("\n");
		expect(msgs).toContain("Starting mutation process for");
		expect(msgs).toContain("File saved successfully");
		expect(client.fileManager.writeFile).toHaveBeenCalledWith("/MuSe/mutants/m1.sol", "contract M1 {}");
	});

	test("executeMutations: nessun mutante generato", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.readFile.mockResolvedValueOnce("pragma solidity ^0.8.0; contract Token {}");
		client.fileManager.writeFile.mockResolvedValue();

		// Mock API for "no mutants" case
		global.fetch = jest
			.fn()
			.mockImplementation(async () => ({
				ok: true,
				json: async () => ({ status: "saved" }),
			}))
			.mockImplementation(async () => ({
				ok: true,
				json: async () => ({ output: 0, message: "No mutants" }),
			}));
		// Non arriviamo alla terza chiamata perché l'hook esce prima

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		act(() => {
			result.current.setSelectedContract("contracts/Token.sol");
		});

		await act(async () => {
			await result.current.executeMutations(["AOR"]);
		});

		const msgs = result.current.consoleMessages.join("\n");
		expect(msgs).toContain("No mutants generated");
	});

	test("executeTesting: salva il report", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.writeFile.mockResolvedValue();

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		act(() => {
			result.current.setSelectedContract("contracts/Token.sol");
		});

		const testFiles = [
			{ name: "Token.hardhat.test.js", content: "describe('Token', ()=>{})" },
			{ name: "Other.hardhat.test.js", content: "describe('Other', ()=>{})" },
		];

		// Mock test API call
		global.fetch = jest.fn().mockImplementation(async () => ({
			ok: true,
			json: async () => ({
				output: "All tests passed",
				report: "<html><body>Report OK</body></html>",
			}),
		}));

		await act(async () => {
			await result.current.executeTesting({ testingFramework: "hardhat", testingTimeOutInSec: 30 }, testFiles);
		});

		const msgs = result.current.consoleMessages.join("\n");
		expect(msgs).toContain("Testing complete: All tests passed");
		expect(client.fileManager.writeFile).toHaveBeenCalledWith(
			"/MuSe/results/report.html",
			"<html><body>Report OK</body></html>"
		);
	});

	test("eventi fileManager: aggiornano la lista contratti", async () => {
		const mockContractsFirst = { "contracts/Token.sol": { isDirectory: false } };
		const mockContractsSecond = {
			"contracts/Token.sol": { isDirectory: false },
			"contracts/New.sol": { isDirectory: false },
		};

		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContractsFirst).mockResolvedValueOnce(mockContractsSecond);

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		expect(result.current.contracts).toEqual(["Token.sol"]);

		await act(async () => {
			client.__emit("fileManager", "fileAdded", { path: "contracts/New.sol" });
			await Promise.resolve();
		});

		expect(result.current.contracts).toEqual(["Token.sol", "New.sol"]);
	});

	test("executeTesting: testing file not found", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.writeFile.mockResolvedValue();

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		act(() => {
			result.current.setSelectedContract("contracts/Token.sol");
		});

		const testFiles = [
			{ name: "Token.hardhat.test.js", content: "describe('Token', ()=>{})" },
			{ name: "Other.hardhat.test.js", content: "describe('Other', ()=>{})" },
		];

		// Mock test API call
		global.fetch = jest.fn().mockImplementationOnce(async () => ({
			ok: true,
			json: async () => ({
				output: "No test files found",
				report: "",
			}),
		}));

		await act(async () => {
			await result.current.executeTesting({ testingFramework: "truffle", testingTimeOutInSec: 30 }, testFiles);
		});

		const msgs = result.current.consoleMessages.join("\n");
		expect(msgs).toContain("No test files found");
	});
	//TODO testare al click del test deve essere selezionato un contratto,
});
