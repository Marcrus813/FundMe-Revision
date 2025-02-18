const { hre, ethers } = require("hardhat");
const { readFileSync } = require("fs");
const path = require("path");

const args = process.argv.slice(2).reduce((acc, arg) => {
	const [key, value] = arg.split("=");
	acc[key] = value;
	return acc;
}, {});

async function main() {
	const addressDir = path.join(
		__dirname,
		".././ignition/deployments/chain-31337/deployed_addresses.json"
	);
	const fundMeAddress = JSON.parse(readFileSync(path.join(addressDir)))[
		"FundMeModule#FundMe"
	];
	const FundMeContract = await ethers.getContractAt("FundMe", fundMeAddress);

	const fundMeInitialBalance = await ethers.provider.getBalance(
		fundMeAddress
	);
	console.log(
		`FundMe initial balance: ${ethers.formatEther(fundMeInitialBalance)}`
	);

	const [owner, , funder] = await ethers.getSigners();
	const funderInitialBalance = await ethers.provider.getBalance(
		funder.address
	);
	console.log(
		`Funder initial balance: ${ethers.formatEther(funderInitialBalance)}`
	);
	await FundMeContract.connect(funder).fund({
		value: ethers.parseEther("0.05"),
	});
	const funderFinalBalance = await ethers.provider.getBalance(funder.address);
	console.log(
		`Funder final balance: ${ethers.formatEther(funderFinalBalance)}`
	);
	const response = await FundMeContract.addressToAmountFunded(funder.address);
	console.log(response.toString());

	const fundedBalance = await ethers.provider.getBalance(fundMeAddress);
	console.log("FundMe funded balance: ", ethers.formatEther(fundedBalance));

	await FundMeContract.connect(owner).withdraw();
	const FundMeFinalBalance = await ethers.provider.getBalance(fundMeAddress);
    const ownerFinalBalance = await ethers.provider.getBalance(owner.address);
	console.log(`FundMe final balance: ${ethers.formatEther(FundMeFinalBalance)}`);
    console.log(`Owner final balance: ${ethers.formatEther(ownerFinalBalance)}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
