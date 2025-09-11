import { jest } from "@jest/globals";
import * as realPath from "path";

// 1. Mock dei moduli core PRIMA di importare il codice sotto test
jest.unstable_mockModule("fs", () => ({
	readdir: jest.fn(),
	lstatSync: jest.fn(),
	copyFile: jest.fn(),
	existsSync: jest.fn(),
}));
jest.unstable_mockModule("path", () => ({
	...realPath,
	join: jest.fn(), // mock solo join
}));

const { copyTestConfig } = await import("../../app.js");
const fs = await import("fs");
const path = await import("path");

describe("copyTestConfig", () => {
	beforeEach(() => jest.clearAllMocks());

	it("[TC-U_1.1] Copy all the files from the template folder", () => {
		fs.readdir.mockImplementation((dir, cb) => cb(null, ["a.txt", "b.txt"]));
		fs.lstatSync.mockReturnValue({ isFile: () => true });
		path.join.mockImplementation((...args) => args.join("/"));
		fs.copyFile.mockImplementation((src, dest, cb) => cb(null));

		copyTestConfig();

		expect(fs.copyFile).toHaveBeenCalledTimes(2);
		expect(fs.copyFile).toHaveBeenCalledWith(
			expect.stringContaining("a.txt"),
			expect.stringContaining("a.txt"),
			expect.any(Function)
		);
	});

	it("[TC-U_1.2] Empty folder should copy nothing", () => {
		fs.readdir.mockImplementation((dir, cb) => cb(null, []));
		copyTestConfig();
		expect(fs.copyFile).not.toHaveBeenCalled();
	});

	it("[TC-U_1.3] Only files should be copied, folders are ignored", () => {
		fs.readdir.mockImplementation((dir, cb) => cb(null, ["a.txt", "dir"]));
		fs.lstatSync.mockImplementation((p) => ({
			isFile: () => p.includes("a.txt"),
		}));
		path.join.mockImplementation((...args) => args.join("/"));
		fs.copyFile.mockImplementation((src, dest, cb) => cb(null));

		copyTestConfig();

		expect(fs.copyFile).toHaveBeenCalledTimes(1);
		expect(fs.copyFile).toHaveBeenCalledWith(
			expect.stringContaining("a.txt"),
			expect.stringContaining("a.txt"),
			expect.any(Function)
		);
	});

	it("[TC-U_1.4] Handles error in readdir and exits the process", () => {
		const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("EXIT");
		});
		fs.readdir.mockImplementation((dir, cb) => cb(new Error("fail"), null));
		expect(() => copyTestConfig()).toThrow("EXIT");
		expect(exitSpy).toHaveBeenCalledWith(1);
		exitSpy.mockRestore();
	});
});
