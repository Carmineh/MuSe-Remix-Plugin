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

	it("ritorna tutti i file ricorsivamente", () => {
		fs.readdirSync.mockReturnValueOnce(["file1", "dir1"]).mockReturnValueOnce(["nested.txt"]);

		fs.statSync
			.mockReturnValueOnce({ isDirectory: () => false })
			.mockReturnValueOnce({ isDirectory: () => true })
			.mockReturnValueOnce({ isDirectory: () => false });

		path.join.mockImplementation((...args) => args.join("/"));

		const result = getAllFiles("/root");
		expect(result).toEqual(["/root/file1", "/root/dir1/nested.txt"]);
	});
});
