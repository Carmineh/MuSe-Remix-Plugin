import { renderHook, act } from "@testing-library/react";
import { useRemixClient } from "../useRemixClient";
import { createClient } from "@remixproject/plugin-iframe";

jest.mock("@remixproject/plugin-iframe");

const API_URL = "http://localhost:3001";

// Polyfills for TextEncoder and TextDecoder
global.TextEncoder = class {
	encode(str) {
		return new Uint8Array(Buffer.from(str, "utf8"));
	}
};

global.TextDecoder = class {
	decode(bytes) {
		return Buffer.from(bytes).toString("utf8");
	}
};

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
	//ok
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
	//ok
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
	//ok
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
	//ok
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
	//ok
	test("executeMutations: flusso completo successo", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;

		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.readFile.mockResolvedValueOnce("pragma solidity ^0.8.0; contract Token {}");
		client.fileManager.writeFile.mockResolvedValue();
		client.fileManager.remove = jest.fn().mockResolvedValue();

		// Mock API calls with separate implementations for each call
		global.fetch = jest
			.fn()
			.mockImplementationOnce(async () => ({
				ok: true,
				json: async () => ({ status: "saved" }),
			}))
			.mockImplementationOnce(async () => ({
				ok: true,
				json: async () => ({ output: 3, message: "Mutants generated" }),
			}))
			.mockImplementationOnce(async () => ({
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
		expect(msgs).toContain("3 mutants generated");
		expect(client.fileManager.writeFile).toHaveBeenCalledWith("/MuSe/mutants/m1.sol", "contract M1 {}");
	});
	//ok
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
			.mockImplementationOnce(async () => ({
				ok: true,
				json: async () => ({ status: "saved" }),
			}))
			.mockImplementationOnce(async () => ({
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
	//ok
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

		// Mock streaming response
		const mockReader = {
			read: jest
				.fn()
				.mockResolvedValueOnce({
					value: new TextEncoder().encode('{"type":"log","line":"All tests passed"}\n'),
					done: false,
				})
				.mockResolvedValueOnce({
					value: new TextEncoder().encode('{"type":"report","content":"<html><body>Report OK</body></html>"}\n'),
					done: false,
				})
				.mockResolvedValueOnce({
					value: new TextEncoder().encode('{"type":"done","code":0}\n'),
					done: false,
				})
				.mockResolvedValueOnce({
					value: undefined,
					done: true,
				}),
		};

		global.fetch = jest.fn().mockImplementationOnce(async () => ({
			ok: true,
			body: {
				getReader: () => mockReader,
			},
		}));

		await act(async () => {
			await result.current.executeTesting({ testingFramework: "hardhat", testingTimeOutInSec: 30 }, testFiles);
		});

		const msgs = result.current.consoleMessages.join("\n");
		expect(msgs).toContain("Report received");
		expect(msgs).toContain("Report saved to /MuSe/results/report.html");
		expect(client.fileManager.writeFile).toHaveBeenCalledWith(
			"/MuSe/results/report.html",
			"<html><body>Report OK</body></html>"
		);
	});

	//ok
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

	//ok
	test("inizializzazione fallita: createClient lancia errore", async () => {
		const { createClient } = require("@remixproject/plugin-iframe");
		createClient.mockImplementationOnce(() => {
			throw new Error("boom");
		});

		const { result } = renderHook(() => useRemixClient());

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		expect(result.current.isLoading).toBe(false);
		expect(result.current.consoleMessages.some((m) => m.includes("Failed to initialize plugin: boom"))).toBe(true);
	});

	//ok
	test("executeMutations con errore di fetch", async () => {
		const mockContracts = { "contracts/Token.sol": { isDirectory: false } };
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;
		client.fileManager.readdir.mockResolvedValueOnce(mockContracts);
		client.fileManager.readFile.mockResolvedValueOnce("contract C {}");

		global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

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

		expect(result.current.consoleMessages.some((m) => m.includes("Error during mutation execution"))).toBe(true);
	});

	//ok
	test("executeTesting con errore API (ok=false)", async () => {
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

		global.fetch = jest.fn().mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Bad request" }),
		});

		await act(async () => {
			await result.current.executeTesting({ testingFramework: "hardhat", testingTimeOutInSec: 10 }, []);
		});

		expect(result.current.consoleMessages.some((m) => m.includes("Testing error: Bad request"))).toBe(true);
	});

	//ok
	test("executeTesting con eccezione di rete", async () => {
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

		global.fetch = jest.fn().mockRejectedValue(new Error("network fail"));

		await act(async () => {
			await result.current.executeTesting({ testingFramework: "hardhat", testingTimeOutInSec: 10 }, []);
		});

		expect(result.current.consoleMessages.some((m) => m.includes("Error during testing: network fail"))).toBe(true);
	});

	//ok
	test("loadContracts senza client non fa nulla", async () => {
		const { result } = renderHook(() => useRemixClient());
		await act(async () => {
			await result.current.loadContracts();
		});
		expect(result.current.contracts).toEqual([]);
	});

	//ok
	test("getContractsFromRemix ignora file non .sol", async () => {
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;
		client.fileManager.readdir.mockResolvedValueOnce({
			"contracts/ignore.txt": { isDirectory: false },
			"contracts/Keep.sol": { isDirectory: false },
		});

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
		});

		expect(result.current.contracts).toEqual(["Keep.sol"]);
	});

	//ok
	test("getTestFiles ritorna solo file non directory", async () => {
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;
		client.fileManager.readdir.mockResolvedValueOnce({
			"tests/a.js": { isDirectory: false },
			"tests/folder": { isDirectory: true },
		});
		client.fileManager.readFile.mockResolvedValue("content");
		const files = await result.current.getTestFiles();
		expect(files).toEqual([{ name: "a.js", content: "content" }]);
	});
	//ok
	test("getTestFiles con errore ritorna []", async () => {
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;
		client.fileManager.readdir.mockRejectedValueOnce(new Error("bad tests"));

		const files = await result.current.getTestFiles();
		expect(files).toEqual([]);
	});

	//ok
	test("updateConsole funziona", () => {
		const { result } = renderHook(() => useRemixClient());

		act(() => {
			result.current.updateConsole("Messaggio di test");
		});
		expect(result.current.consoleMessages.length).toBe(1);
	});
	//ok
	test("clearConsole funziona", () => {
		const { result } = renderHook(() => useRemixClient());

		act(() => {
			result.current.updateConsole("first message");
			result.current.updateConsole("second message");
		});
		expect(result.current.consoleMessages.length).toBe(2);

		act(() => {
			result.current.clearConsole();
		});
		expect(result.current.consoleMessages.length).toBe(0);
	});
	//ok
	test("getContractsFromRemix logga errore su console.error", async () => {
		const spy = jest.spyOn(console, "error").mockImplementation(() => {});
		const { result } = renderHook(() => useRemixClient());
		const { createClient } = require("@remixproject/plugin-iframe");
		const client = createClient.mock.results.slice(-1)[0].value;
		client.fileManager.readdir.mockRejectedValueOnce(new Error("bad read"));

		await act(async () => {
			advanceAllTimers();
			await Promise.resolve();
			await result.current.loadContracts();
		});

		expect(spy).toHaveBeenCalledWith(expect.stringContaining("Error reading contracts:"), expect.any(Error));
		spy.mockRestore();
	});
});
