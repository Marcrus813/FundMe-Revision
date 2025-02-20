const { expect, assert } = require("chai");
const fundMeModule = require("../../ignition/modules/01-Fund-Me");
const { ethers, ignition } = require("hardhat");
const {
	networkConfig,
	devChains,
	mockPrams,
} = require("../../helper-hardhat-config");

const network = process.env.NETWORK || "hardhat";
const localFlag = devChains.includes(network);
localFlag
	? describe.skip
	: 
    describe("FundMe", () => {
			let fundMeContract;
			let fundMeAddress;

			beforeEach(async () => {
				const {fundMe} = await ignition.deploy(fundMeModule);
				fundMeContract = fundMe;
				fundMeAddress = await fundMe.getAddress();
			});

			it("Should update funding record", async () => {
				const sufficientEth = ethers.parseEther("0.03");
				const [funder] = await ethers.getSigners();
				await fundMeContract.connect(funder).fund({ value: sufficientEth });
				const response = await fundMeContract.getAddressToAmountFunded(
					funder.address
				);
				expect(response).to.equal(sufficientEth);
			});
	  });
