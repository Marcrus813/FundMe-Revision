const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsePriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    1: {
        name: "mainnet",
        ethUsePriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    },
    31337: {
        name: "hardhat",
        ethUsePriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    }
}

const devChains = ["hardhat", "localhost"];
const mockPrams = {
    MockV3Aggregator: {
        decimals: 8,
        initialAnswer: 200000000000
    }
}

module.exports = {
    networkConfig,
    devChains,
    mockPrams
};