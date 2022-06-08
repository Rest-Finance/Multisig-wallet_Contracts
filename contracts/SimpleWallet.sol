//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Owners.sol";

contract SimpleWallet is Owners {

    function deposit() public payable {
        console.log("Deposit of ", msg.value);
    }

    function withdraw(address to, uint256 amount)
        public
        payable
        virtual
        onlyOwner
    {
        payable(to).transfer(amount);
    }
}
