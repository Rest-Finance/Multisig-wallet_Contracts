//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./MultisigWallet.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

interface IMultisigWallet {
    function seedAfterCloned(address ownerAddress) external;
}

contract FactoryWallets {
    address private _refContractAddress;
    address public _owner;

    address[] private contracts;
    mapping(address => uint256[]) private contractsIds;

    event NewContract(address contractAddress);

    modifier onlyOwner() {
        require(_owner == msg.sender, "Not Allowed");
        _;
    }

    constructor() {
        _owner = msg.sender;
    }

    function setRefContractAddress(address newAddress) public onlyOwner {
        _refContractAddress = newAddress;
    }

    function newContract() public {
        address clonedContractAddress = Clones.clone(_refContractAddress);
        emit NewContract(clonedContractAddress);
        IMultisigWallet(clonedContractAddress).seedAfterCloned(msg.sender);
        contractsIds[msg.sender].push(contracts.length);
        contracts.push(clonedContractAddress);
    }

    function getUserContracts() public view returns (address[] memory) {
        uint256[] memory userContractsIds = contractsIds[msg.sender];
        address[] memory userContracts = new address[](userContractsIds.length);

        for (uint256 i; i < userContractsIds.length; i++) {
            userContracts[i] = contracts[userContractsIds[i]];
        }
        return userContracts;
    }
}
