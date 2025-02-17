const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { devChains, mockPrams } = require("../../helper-hardhat-config");

module.exports = buildModule("MockV3AggregatorModule", (m) => {
	const network = process.env.NETWORK || "hardhat";
	if (devChains.includes(network)) {
		console.log("Local environment detected, deploying mock contracts...");

		const decimals = mockPrams.MockV3Aggregator.decimals;
		const initialAnswer = mockPrams.MockV3Aggregator.initialAnswer;
	
		const mockV3Aggregator = m.contract("MockV3Aggregator", [decimals, initialAnswer]);
	
		return { mockV3Aggregator };
	} else {
		console.log("On chain environment detected, skipped mocks");
	}
});
