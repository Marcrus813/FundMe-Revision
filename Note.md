# Lesson 7 `FundMe` Note

## Setup

-   Hardhat, hardhat-gas-reporter, solidity-coverage, solhint

## Hardhat deploy

[Examples](https://github.com/NomicFoundation/hardhat-ignition-examples)

-   Chain awareness
    -   Currently ignition is not chain-aware, my current workaround is specify chain with ENV: `NETWORK=sepolia yarn hardhat ignition deploy ignition/modules/01-Fund-Me.js --network sepolia`
    -   Mocks
        -   Ignition does not support manual control, thus deploying mock with chain awareness is tricky
            -   Ideas
                -   ~~Use mock as library, deploy only on devChains~~
        -   Solved
            -   See source code
                -   After flag confirmed, pass the instance, ignition will figure out that its address is needed, then in options param, use `after`
    -   Code to get contract address:
        ```javascript
        const priceFeedAddress = await fundMe.priceFeed();
        expect(priceFeedAddress).to.equal(mockV3Aggregator.target);
        ```
    -   Verification
        -   Add option `verify: true`
-   Field params
    -   Still unknown
        -   `verify`, `value`...

## Solidity style guide

-   Purpose
    -   Use `solc` to generate documentation

## Testing

-   Staging and unit
    -   Unit focusing on smaller aspects, Staging focusing on general behavior, staging test thus should be last step of testing
-   Migration from `hardhat-deploy`
    -   Since we are using `ignition` to deploy, differences are mainly about how to interact with the contract
        -   Getting address
            -   `fundMe.target`, I got this from using debug terminal, seeing the address under property `target`, works fine so far
        -   Connecting
            -   `await fundMe.connect(funder).fund({ value: sufficientEth });`
    -   Getting deployer
        -   User `ethers.ethers.getSigners();`
            -   JavaScript note: `const [deployer] = await ethers.getSigners();` gets the first object of the array `const [,deployer] = await ethers.getSigners();` gets the second, `,` meaning skipped one, like in solidity
-   Catching custom error
    -   `await expect(fundMe.connect(nonOwner).withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");`
-   How to test function calls are correctly routed to `fallback` or `receive`

## Storage in Solidity(_Follow up note, for main body, see note of `Hardhat-Fund_me` repo on github_)

-   Array
    -   [2] stores its length, where spot "2" is determined by the contract, spot `keccak256(2)`(hashing the spot index) will be the starting point of the array elements
-   Question: are private/internal variables and functions absolutely PRIVATE?
    -   Answer: No, one way to do it is get storage stack using `ethers.provider.getStorageAt(contract.address, index)`
        -   More detailed explanation
            -   Private referring to inaccessible to other contracts or external users by function call, but it is accessible through Etherscan or low-level methods like one mentioned above
