import { jest } from "@jest/globals";
import * as realPath from "path";

jest.unstable_mockModule("fs", () => ({
	readdirSync: jest.fn(),
	statSync: jest.fn(),
}));
jest.unstable_mockModule("path", () => ({
	...realPath,
	join: jest.fn(),
}));

const { getAllFiles } = await import("../../app.js");
const fs = await import("fs");
const path = await import("path");

describe("getAllFiles", () => {
	beforeEach(() => jest.clearAllMocks());

	it("[TC-U_2.1] Returns all files recursively", () => {
		fs.readdirSync.mockReturnValueOnce(["file1", "dir1"]).mockReturnValueOnce(["nested.txt"]);

		fs.statSync
			.mockReturnValueOnce({ isDirectory: () => false }) // file1
			.mockReturnValueOnce({ isDirectory: () => true }) // dir1
			.mockReturnValueOnce({ isDirectory: () => false }); // nested.txt

		path.join.mockImplementation((...args) => args.join("/"));

		const result = getAllFiles("/root");

		expect(result).toEqual(["/root/file1", "/root/dir1/nested.txt"]);
	});

	it("[TC-U_2.2] Folder exists but contains no files", () => {
		fs.readdirSync.mockReturnValue([]); 
		const result = getAllFiles("/empty");
		expect(result).toEqual([]);
	});
});
