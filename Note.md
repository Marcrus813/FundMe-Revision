# Lesson 7 `FundMe` Note

## Open source contribution
- Github repo -> Issues -> Label: "Good first issue" / "Help wanted" etc.

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
        const { fundMe, mockV3Aggregator } = await ignition.deploy(
			fundMeModule
		);
		fundMeAddress = await fundMe.getAddress();
		mockV3AggregatorAddress = await mockV3Aggregator.getAddress();
		return { fundMe, mockV3Aggregator };
        ```
    -   Verification
        -   Add option `verify: true`
-   Field params
    -   Still unknown
        -   `verify`, `value`...

## Solidity style guide

-   Purpose
    -   Use `solc` to generate documentation

## Unit Testing

-   Staging and unit
    -   Unit focusing on smaller aspects, Staging focusing on general behavior, staging test thus should be last step of testing
-   Migration from `hardhat-deploy`
    -   Since we are using `ignition` to deploy, differences are mainly about how to interact with the contract
        -   Getting address
            -   ~~`fundMe.target`, I got this from using debug terminal, seeing the address under property `target`, works fine so far~~
            - Use `await contract.getAddress(contract)` where `contract` is a returned object from ignition script
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

## Stage Testing
- Differences
    - Fixture will not be possible, mocks won't be needed
        - Using hardhat ignition: in `beforeEach`, do `ignition.deploy(contractModule)`, if already deployed, it will get us the contract
    - Gas
        - If owner calling `withdraw`, who's paying gas? Contract or owner
            - See second stage test, it passes -> Owner pays
- `ethers.getSigners`
    - In hardhat, it will return array of the presets accounts, in test net, it will return pre-configured accounts: `hardhat.config.js: networks.sepolia.accounts`