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
	: describe("FundMe", () => {
			let fundMeContract;
			let fundMeAddress;

			beforeEach(async () => {
				const { fundMe } = await ignition.deploy(fundMeModule);
				fundMeContract = fundMe;
				fundMeAddress = await fundMe.getAddress();
			});

			it("Should update funding record", async () => {
				const [funder] = await ethers.getSigners();
				const initialRecord =
					await fundMeContract.getAddressToAmountFunded(
						funder.address
					);

				const sufficientEth = ethers.parseEther("0.03");
				await (
					await fundMeContract
						.connect(funder)
						.fund({ value: sufficientEth })
				).wait(2);

				const response = await fundMeContract.getAddressToAmountFunded(
					funder.address
				);
				expect(response).to.equal(sufficientEth + initialRecord);
			});

			it("Should allow owner to withdraw", async () => {
				const [owner] = await ethers.getSigners();
				const initialWalletBalance = await ethers.provider.getBalance(
					owner.address
				);

				const sufficientEth = ethers.parseEther("0.03");

				const fundTxnResponse = await fundMeContract.connect(owner).fund({
					value: sufficientEth,
				});
				const fundTxnReceipt = await fundTxnResponse.wait(2);
				const fundTxnFee = fundTxnReceipt.fee;
				const initialContractBalance = await ethers.provider.getBalance(
					fundMeAddress
				);

				const withdrawTxnResponse = await fundMeContract
					.connect(owner)
					.withdraw();
				const withdrawTxnReceipt = await withdrawTxnResponse.wait(2);
				const withdrawTxnFee = withdrawTxnReceipt.fee;

				const actualFinalWalletBalance = await ethers.provider.getBalance(owner.address);
				const expectedFinalBalance = initialWalletBalance - fundTxnFee - sufficientEth - withdrawTxnFee + initialContractBalance;
				expect(actualFinalWalletBalance).to.equal(expectedFinalBalance);
			}).timeout(1000000);
	  });
