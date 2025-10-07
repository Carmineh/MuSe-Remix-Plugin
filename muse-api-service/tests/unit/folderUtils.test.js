import { jest } from "@jest/globals";
import * as realPath from "path";

// 1. Mock dei moduli core PRIMA di importare le funzioni
jest.unstable_mockModule("fs", () => ({
	existsSync: jest.fn(),
	mkdirSync: jest.fn(),
	readdirSync: jest.fn(),
	rmSync: jest.fn(),
}));
jest.unstable_mockModule("path", () => ({
	...realPath,
	join: jest.fn((...args) => args.join("/")), // mock join
}));

// 2. Importiamo dopo aver mockato
const { createFolders, clearFolders } = await import("../../app.js");
const fs = await import("fs");
const path = await import("path");

describe("createFolders", () => {
	beforeEach(() => jest.clearAllMocks());

	it("creates folders that do not exist", () => {
		fs.existsSync.mockReturnValue(false);

		const dirs = ["/folder1", "/folder2"];
		createFolders(dirs);

		expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
		expect(fs.mkdirSync).toHaveBeenCalledWith("/folder1", { recursive: true });
		expect(fs.mkdirSync).toHaveBeenCalledWith("/folder2", { recursive: true });
	});

	it("does not create folders that already exist", () => {
		fs.existsSync.mockReturnValue(true);

		const dirs = ["/folder1", "/folder2"];
		createFolders(dirs);

		expect(fs.mkdirSync).not.toHaveBeenCalled();
	});
});

describe("clearFolders", () => {
	beforeEach(() => jest.clearAllMocks());

	it("clears all files in existing directories", () => {
		fs.existsSync.mockReturnValue(true);
		fs.readdirSync.mockReturnValue(["file1.txt", "file2.txt"]);

		const dirs = ["/dir1"];
		clearFolders(dirs);

		expect(fs.readdirSync).toHaveBeenCalledWith("/dir1");
		expect(fs.rmSync).toHaveBeenCalledTimes(2);
		expect(fs.rmSync).toHaveBeenCalledWith("/dir1/file1.txt", { recursive: true, force: true });
		expect(fs.rmSync).toHaveBeenCalledWith("/dir1/file2.txt", { recursive: true, force: true });
	});

	it("does nothing for directories that do not exist", () => {
		fs.existsSync.mockReturnValue(false);

		const dirs = ["/dir1"];
		clearFolders(dirs);

		expect(fs.readdirSync).not.toHaveBeenCalled();
		expect(fs.rmSync).not.toHaveBeenCalled();
	});
});
