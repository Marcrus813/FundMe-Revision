const { expect, assert } = require("chai");
const {FundMeModule} = require("../../ignition/modules/01-Fund-Me");
const { ignition } = require("hardhat");
const { loadFixture, } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FundMe", () => {
    async function deployContractFixture() {
        const { fundMe } = await ignition.deploy(FundMeModule);
        return { fundMe };
    }

    describe("Deployment", () => {
        it("Should set aggregator address correctly", async () => {
            const { fundMe } = await loadFixture(deployContractFixture);
            const priceFeedAddress = await fundMe.priceFeed();
            assert.notEqual(priceFeedAddress, "0x0000000000000000000000000000000000000000");
        });
    });
});
