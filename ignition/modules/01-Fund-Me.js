const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const {
	networkConfig,
	devChains,
	mockPrams,
} = require("../../helper-hardhat-config");

module.exports = buildModule("FundMeModule", (m) => {
	const network = process.env.NETWORK || "hardhat";
	const localFlag = devChains.includes(network);
	let fundMe;
	switch (localFlag) {
		case true:
			const mockV3Aggregator = m.contract("MockV3Aggregator", [
				mockPrams.MockV3Aggregator.decimals,
				mockPrams.MockV3Aggregator.initialAnswer,
			]);

			// Does not need the file path, just the instance of the contract, ignition will figure it out
			fundMe = m.contract("FundMe", [mockV3Aggregator], {
				after: [mockV3Aggregator],
			});

			return { fundMe, mockV3Aggregator };

		default:
			const networkToChainId = {
				sepolia: 11155111,
				hardhat: 31337,
			};
			const chainId = networkToChainId[network];

			const priceFeedAddress = networkConfig[chainId].ethUsePriceFeed;

			fundMe = m.contract("FundMe", [priceFeedAddress], {
				verify: true,
			});

			return { fundMe };
	}
});
