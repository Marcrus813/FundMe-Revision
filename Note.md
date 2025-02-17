# Lesson 7 `FundMe` Note
## Setup
- Hardhat, hardhat-gas-reporter, solidity-coverage, solhint
## Hardhat deploy
[Examples](https://github.com/NomicFoundation/hardhat-ignition-examples)
- Chain awareness
    - Currently ignition is not chain-aware, my current workaround is specify chain with ENV: `NETWORK=sepolia yarn hardhat ignition deploy ignition/modules/01-Fund-Me.js --network sepolia`
    - Mocks
        - Ignition does not support manual control, thus deploying mock with chain awareness is tricky
            - Ideas
                - ~~Use mock as library, deploy only on devChains~~
        - Solved
            - See source code
                - After flag confirmed, pass the instance, ignition will figure out that its address is needed, then in options param, use `after`
    - Verification
        - Add option `verify: true`
- Field params
    - Still unknown
        - `verify`, `value`...
## Solidity style guide
- Purpose
    - Use `solc` to generate documentation
## Testing
- Staging and unit
    - Unit focusing on smaller aspects, Staging focusing on general behavior, staging test thus should be last step of testing
