const { ignition, ethers } = require("hardhat");
const fundMeModule = require("../ignition/modules/01-Fund-Me");
const { readFileSync } = require("fs");
const path = require("path");
const {
	networkConfig,
	devChains,
	mockPrams,
} = require("../helper-hardhat-config");

const args = process.argv.slice(2).reduce((acc, arg) => {
	const [key, value] = arg.split("=");
	acc[key] = value;
	return acc;
}, {});

async function main() {
	const network = process.env.NETWORK || "hardhat";
	const localFlag = devChains.includes(network);

	const deployments = await ignition.deploy(fundMeModule);
	const fundMe = deployments.fundMe;
	const fundMeContract = fundMe;
	const fundMeAddress = await fundMeContract.getAddress();

	const fundMeInitialBalance = await ethers.provider.getBalance(
		fundMeAddress
	);
	console.log(
		`FundMe initial balance: ${ethers.formatEther(fundMeInitialBalance)}`
	);

	let owner, funder;
	switch (localFlag) {
		case true:
			const [local_owner, , local_funder] = await ethers.getSigners();
			owner = local_owner;
			funder = local_funder;
			break;
	
		default:
			const [testnet_owner] = await ethers.getSigners();
			funder = owner = testnet_owner;
			break;
	}
	
	/*const funderInitialBalance = await ethers.provider.getBalance(
		funder.address
	);
	console.log(
		`Funder initial balance: ${ethers.formatEther(funderInitialBalance)}`
	);
	await fundMeContract.connect(funder).fund({
		value: ethers.parseEther("0.05"),
	});
	const funderFinalBalance = await ethers.provider.getBalance(funder.address);
	console.log(
		`Funder final balance: ${ethers.formatEther(funderFinalBalance)}`
	);
	const response = await fundMeContract.getAddressToAmountFunded(funder.address);
	console.log(response.toString());

	const fundedBalance = await ethers.provider.getBalance(fundMeAddress);
	console.log("FundMe funded balance: ", ethers.formatEther(fundedBalance));

	await fundMeContract.connect(owner).withdraw();
	const FundMeFinalBalance = await ethers.provider.getBalance(fundMeAddress);
	const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
	console.log(
		`FundMe final balance: ${ethers.formatEther(FundMeFinalBalance)}`
	);
	console.log(
		`Owner final balance: ${ethers.formatEther(ownerFinalBalance)}`
	);*/
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
