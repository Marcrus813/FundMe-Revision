const { expect, assert } = require("chai");
const fundMeModule = require("../../ignition/modules/01-Fund-Me");
const { ethers, ignition } = require("hardhat");
const {
	loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {
	networkConfig,
	devChains,
	mockPrams,
} = require("../../helper-hardhat-config");

const network = process.env.NETWORK || "hardhat";
const localFlag = devChains.includes(network);

!localFlag ? describe.skip : 

describe("FundMe", () => {
	let fundMe;
	let fundMeAddress;
	let mockV3Aggregator;
	let mockV3AggregatorAddress;

	async function deployContractFixture() {
		const { fundMe, mockV3Aggregator } = await ignition.deploy(
			fundMeModule
		);
		fundMeAddress = await fundMe.getAddress();
		mockV3AggregatorAddress = await mockV3Aggregator.getAddress();
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
			const i_owner = await fundMe.getOwner();
			expect(i_owner).to.equal(deployer);
		});

		it("Should set aggregator address correctly", async () => {
			const priceFeedAddress = await fundMe.getPriceFeed();
			expect(priceFeedAddress).to.equal(mockV3AggregatorAddress);
		});
	});

	describe("Funding", () => {
		it("Should detect insufficient funds", async () => {
			const insufficientEth = ethers.parseEther("0.024"); // Initial answer is set to `200000000000`
			await expect(
				fundMe.fund({ value: insufficientEth })
			).to.be.revertedWithCustomError(fundMe, "FundMe__NotEnoughEth");
		});
		it("Should update funding record", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder] = await ethers.getSigners();
			await fundMe.connect(funder).fund({ value: sufficientEth });
			const response = await fundMe.getAddressToAmountFunded(funder.address);
			expect(response).to.equal(sufficientEth);
		});

		it("Should update funder record", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder] = await ethers.getSigners();
			await fundMe.connect(funder).fund({ value: sufficientEth });
			const response = await fundMe.getFunder(0);
			expect(response).to.equal(funder.address);
		});

		it("Should record multiple funding", async () => {
			const sufficientEth = ethers.parseEther("0.03");
			const [, , funder0, , funder1] = await ethers.getSigners();
			await fundMe.connect(funder0).fund({ value: sufficientEth });
			await fundMe.connect(funder0).fund({ value: sufficientEth });
			await fundMe.connect(funder1).fund({ value: sufficientEth });
			const response0 = await fundMe.getFunder(0);
			const response1 = await fundMe.getFunder(1);
			const response2 = await fundMe.getFunder(2);
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
			await expect(fundMe.getFunder(0)).to.be.reverted;
		});

		it("Should transfer funds to owner", async () => {
			const [owner] = await ethers.getSigners();
			const ownerInitialBalance = await ethers.provider.getBalance(
				owner.address
			);
			const contractInitialBalance = await ethers.provider.getBalance(
				fundMeAddress
			);
			const txnResponse = await fundMe.connect(owner).withdraw();
			const txnReceipt = await txnResponse.wait();
			const { fee } = txnReceipt;
			const ownerFinalBalance = await ethers.provider.getBalance(
				owner.address
			);

			const contractFinalBalance = await ethers.provider.getBalance(
				fundMeAddress
			);

			expect(contractFinalBalance).to.be.equals(0);
			expect(ownerFinalBalance + fee).to.be.equals(
				ownerInitialBalance + contractInitialBalance
			);
		});

		it("Should work with multiple funders", async () => {
			const funders = await ethers.getSigners();
			for (let index = 2; index < funders.length; index++) {
				// Skip owner and already funded funder
				const signer = funders[index];
				await fundMe
					.connect(signer)
					.fund({ value: ethers.parseEther("0.03") });
			}
			const owner = funders[0];
			const ownerInitialBalance = await ethers.provider.getBalance(
				owner.address
			);
			const contractInitialBalance = await ethers.provider.getBalance(
				fundMeAddress
			);
			const txnResponse = await fundMe.connect(owner).withdraw();
			const txnReceipt = await txnResponse.wait();
			const { fee } = txnReceipt;
			const ownerFinalBalance = await ethers.provider.getBalance(
				owner.address
			);

			const contractFinalBalance = await ethers.provider.getBalance(
				fundMeAddress
			);

			expect(contractFinalBalance).to.be.equals(0);
			expect(ownerFinalBalance + fee).to.be.equals(
				ownerInitialBalance + contractInitialBalance
			);
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let index = 0; index < funders.length; index++) {
                const signer = funders[index];
                expect(await fundMe.getAddressToAmountFunded(signer.address)).to.be.equals(0);
            }
		});
	});

	describe("Fallback and receive", () => {});
});
