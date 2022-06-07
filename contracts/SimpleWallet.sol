//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleWallet {
    address[] public owners;
    mapping(address => uint256) owners_id;

    modifier onlyOwner() {
        require(owners[owners_id[msg.sender]] == msg.sender, "Not Allowed");
        _;
    }

    constructor() {
        owners_id[msg.sender] = owners.length;
        owners.push(msg.sender);
    }

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

    function addOwner(address new_owner) public virtual onlyOwner {
        owners_id[new_owner] = owners.length;
        owners.push(new_owner);
    }
}
