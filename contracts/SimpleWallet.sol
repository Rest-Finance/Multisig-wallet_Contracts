//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleWallet {
    address[] public owners;
    mapping(address => uint256) owners_id;
    event NewOwner(uint256 at, address from, address to);

    modifier onlyOwner() {
        require(owners[owners_id[msg.sender]] == msg.sender, "Not Allowed");
        _;
    }

    constructor() {
        owners_id[msg.sender] = owners.length;
        owners.push(msg.sender);
    }

    function addOwner(address newOwner) public virtual onlyOwner {
        owners_id[newOwner] = owners.length;
        owners.push(newOwner);

        emit NewOwner(block.timestamp, msg.sender, newOwner);
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
}
