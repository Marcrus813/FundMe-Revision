const { expect, assert } = require("chai");
const fundMeModule = require("../../ignition/modules/01-Fund-Me");
const { ethers, ignition } = require("hardhat");
const {
	loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FundMe", () => {
	let fundMe;
	let mockV3Aggregator;

	async function deployContractFixture() {
		const { fundMe, mockV3Aggregator } = await ignition.deploy(
			fundMeModule
		);
		return { fundMe, mockV3Aggregator };
	}

	beforeEach(async () => {
		// Roll back to deployment fixture
		const contracts = await loadFixture(deployContractFixture);
		fundMe = contracts.fundMe;
		mockV3Aggregator = contracts.mockV3Aggregator;
	});

	describe("Deployment", () => {
		it("Should set `i_owner` to deployer", async () => {
			const [deployer] = await ethers.getSigners();
			const i_owner = await fundMe.i_owner();
			expect(i_owner).to.equal(deployer);
		});

		it("Should set aggregator address correctly", async () => {
			const priceFeedAddress = await fundMe.priceFeed();
			expect(priceFeedAddress).to.equal(mockV3Aggregator.target);
		});
	});

	describe("Funding", () => {
		it("Should detect insufficient funds", async () => {
			const insufficientEth = ethers.parseEther("0.024"); // Initial answer is set to `200000000000`
			await expect(
				fundMe.fund({ value: insufficientEth })
			).to.be.revertedWith("You need to spend more ETH!");
		});
		it("Should update funding record", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder] = await ethers.getSigners();
			await fundMe.connect(funder).fund({ value: sufficientEth });
			const response = await fundMe.addressToAmountFunded(funder.address);
			expect(response).to.equal(sufficientEth);
		});

		it("Should update funder record", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder] = await ethers.getSigners();
			await fundMe.connect(funder).fund({ value: sufficientEth });
			const response = await fundMe.funders(0);
			expect(response).to.equal(funder.address);
		});

		it("Should record multiple funding", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder0, , funder1] = await ethers.getSigners();
			await fundMe.connect(funder0).fund({ value: sufficientEth });
			await fundMe.connect(funder0).fund({ value: sufficientEth });
			await fundMe.connect(funder1).fund({ value: sufficientEth });
			const response0 = await fundMe.funders(0);
			const response1 = await fundMe.funders(1);
			const response2 = await fundMe.funders(2);
			expect(response0).to.equal(funder0.address);
			expect(response1).to.equal(funder0.address);
			expect(response2).to.equal(funder1.address);
		});
	});

	describe("Withdrawing", () => {
		let funder;

		beforeEach(async () => {
			//Fund the contract
			const [, _funder] = await ethers.getSigners();
			funder = _funder;
			const sufficientEth = ethers.parseEther("0.03");
			await fundMe.connect(funder).fund({ value: sufficientEth });
		});

		it("Should deny non-owners from withdrawing", async () => {
			const [, nonOwner] = await ethers.getSigners();
			await expect(
				fundMe.connect(nonOwner).withdraw()
			).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
		});

		it("Should clear record", async () => {
			const [owner] = await ethers.getSigners();
			await fundMe.connect(owner).withdraw();
			const response = await fundMe.addressToAmountFunded(funder.address);
			expect(response).to.equal(0);
		});

		it("Should transfer funds to owner", async () => {
			const [owner] = await ethers.getSigners();
			const ownerInitialBalance = await ethers.provider.getBalance(
				owner.address
			);
			const contractInitialBalance = await ethers.provider.getBalance(
				fundMe.target
			);
			const txnResponse = await fundMe.connect(owner).withdraw();
			const txnReceipt = await txnResponse.wait();
			const { fee } = txnReceipt;
			const ownerFinalBalance = await ethers.provider.getBalance(
				owner.address
			);

			expect(ownerFinalBalance + fee).to.be.equals(
				ownerInitialBalance + contractInitialBalance
			);
		});
	});

	describe("Fallback and receive", () => {});
});
