// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts-ccip/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotEnoughEth();
error FundMe__NotOwner();

/**
 * @title FundMe
 * @author Vicky
 * @notice Revision project for Solidity
 * @dev This implements price feed as library
 */
contract FundMe {
	using PriceConverter for uint256;

	mapping(address => uint256) private s_addressToAmountFunded;
	address[] private s_funders;

	// Could we make this constant?  /* hint: no! We should make it immutable! */
	address private immutable i_owner;
	uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

	AggregatorV3Interface private immutable i_priceFeed;

	constructor(address priceFeedAddress) {
		i_owner = msg.sender;
		i_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	modifier enoughEth() {
		if (msg.value.getConversionRate(i_priceFeed) <= MINIMUM_USD) {
			revert FundMe__NotEnoughEth();
		}
		_;
	}

	function fund() public payable enoughEth {
		// require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
		s_addressToAmountFunded[msg.sender] += msg.value;
		s_funders.push(msg.sender);
	}

	/* function getVersion() public view returns (uint256){
        // ETH/USD price feed address of Sepolia Network.
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        return priceFeed.version();
    } */

	modifier onlyOwner() {
		// require(msg.sender == owner);
		if (msg.sender != i_owner) revert FundMe__NotOwner();
		_;
	}

	function withdraw() public onlyOwner {
		address[] memory fundersMirror = s_funders;
		for (
			uint256 funderIndex = 0;
			funderIndex < fundersMirror.length;
			funderIndex++
		) {
			address funder = fundersMirror[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		// // transfer
		// payable(msg.sender).transfer(address(this).balance);
		// // send
		// bool sendSuccess = payable(msg.sender).send(address(this).balance);
		// require(sendSuccess, "Send failed");
		// call
		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}("");
		require(callSuccess, "Call failed");
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address){
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder) public view returns (uint256){
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns(AggregatorV3Interface){
		return i_priceFeed;
	}

	// Explainer from: https://solidity-by-example.org/fallback/
	// Ether is sent to contract
	//      is msg.data empty?
	//          /   \
	//         yes  no
	//         /     \
	//    receive()?  fallback()
	//     /   \
	//   yes   no
	//  /        \
	//receive()  fallback()

	fallback() external payable {
		fund();
	}

	receive() external payable {
		fund();
	}
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
