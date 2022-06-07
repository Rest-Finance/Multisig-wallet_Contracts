//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SimpleWallet.sol";

contract MultisigWallet is SimpleWallet {
    struct Withdraw {
        bool pending;
        uint256 id;
        address to;
        address[] confirmed_by;
        uint256 amount;
    }
    Withdraw[] private withdraws;
    Withdraw public pendingTransaction;

    struct PendingOwner {
        address ownerAddress;
        address[] approvedBy;
        address[] neededOwners;
    }
    PendingOwner[] private pendingOwners;
    mapping(address => uint256) pendingOwnersIds;
    event NewAllowOwner(PendingOwner pendingOwner);

    function initWithdraw(uint256 amount, address to) public onlyOwner {
        address[] memory confirmedBy = new address[](1);
        confirmedBy[0] = owners[owners_id[msg.sender]];

        Withdraw memory newWithdraw = Withdraw(
            true,
            withdraws.length,
            to,
            confirmedBy,
            amount
        );
        withdraws.push(newWithdraw);
        pendingTransaction = newWithdraw;
    }

    function confirm() public onlyOwner {
        bool canConfirm = true;
        for (uint256 i = 0; i < pendingTransaction.confirmed_by.length; i++) {
            if (pendingTransaction.confirmed_by[i] == msg.sender) {
                canConfirm = false;
            }
        }
        require(canConfirm, "Not allowed to confirm");
        pendingTransaction.confirmed_by.push(msg.sender);

        if (pendingTransaction.confirmed_by.length == owners.length) {
            execWithdraw(pendingTransaction.to, pendingTransaction.amount);
        }
    }

    function execWithdraw(address to, uint256 amount) private onlyOwner {
        require(
            pendingTransaction.confirmed_by.length == owners.length,
            "Withdraw not confirmed by all owners"
        );
        payable(to).transfer(amount);
        pendingTransaction.pending = false;
        withdraws.push(pendingTransaction);
        delete pendingTransaction;
    }

    function withdraw(address to, uint256 amount) public payable override {
        revert("disabled");
    }

    function allowOwner(address ownerAddress) public onlyOwner {
        PendingOwner memory pendingOwner = pendingOwners[
            pendingOwnersIds[ownerAddress]
        ];

        bool canAllowOwner = true;
        for (uint256 i = 0; i < pendingOwner.neededOwners.length; i++) {
            for (uint256 j = 0; j < pendingOwner.approvedBy.length; j++) {
                if (
                    pendingOwner.neededOwners[i] == pendingOwner.approvedBy[j]
                ) {
                    canAllowOwner = false;
                }
            }
        }
        console.log(canAllowOwner);
        if (canAllowOwner) {
            pendingOwners[pendingOwnersIds[ownerAddress]].approvedBy.push(
                msg.sender
            );
        }

        if (
            pendingOwner.approvedBy.length == pendingOwner.neededOwners.length
        ) {
            owners_id[ownerAddress] = owners.length;
            owners.push(ownerAddress);
            delete pendingOwners[pendingOwnersIds[ownerAddress]];
            delete pendingOwnersIds[ownerAddress];
        }
    }

    function getOwners() public view returns (address[] memory) {
        console.log(pendingOwners[0].ownerAddress);
        return owners;
    }

    function requestNewOwner(
        address ownerAddress,
        address[] memory neededOwners
    ) public onlyOwner {
        address[] memory confirmedBy;
        PendingOwner memory newOwner = PendingOwner(
            ownerAddress,
            confirmedBy,
            neededOwners
        );
        pendingOwnersIds[ownerAddress] = pendingOwners.length;
        pendingOwners.push(newOwner);

        allowOwner(ownerAddress);
    }
}
