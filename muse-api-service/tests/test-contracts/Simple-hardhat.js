import { expect } from "chai";
import { ethers } from "hardhat";

describe("Simple contract", function () {
	let simple;

	beforeEach(async function () {
		const Simple = await ethers.getContractFactory("Simple");
		simple = await Simple.deploy();
		await simple.deployed();
	});

	it("should increment correctly", async function () {
		await simple.increment();
		expect(await simple.value()).to.equal(1);
	});

	it("should decrement correctly", async function () {
		await simple.decrement();
		expect(await simple.value()).to.equal(0);
	});
});
