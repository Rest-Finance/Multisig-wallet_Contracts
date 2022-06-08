//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./SimpleWallet.sol";

contract MultisigWallet is SimpleWallet {
    struct Withdraw {
        uint256 at;
        bool pending;
        address to;
        address[] confirmedBy;
        address[] neededOwners;
        uint256 amount;
    }
    Withdraw public pendingTransaction;
    enum WithdrawSteps {
        INIT,
        CONFIRMED,
        EXEC
    }
    event WithdrawStep(
        WithdrawSteps step,
        uint256 date,
        address to,
        address[] confirmedBy,
        address[] neededOwners,
        uint256 amount
    );

    function initWithdraw(
        uint256 amount,
        address to,
        address[] memory neededOwners
    ) public onlyOwner {
        require(
            block.timestamp - pendingTransaction.at > 10 * 60,
            "Need at least 10minutes before each withdraw initialization"
        );
        require(
            neededOwners.length > 1,
            "Need at least 2 address to confirm the transaction"
        );

        for (uint256 i = 0; i < neededOwners.length; i++) {
            bool addressIsOwner = false;
            for (uint256 j = 0; j < owners.length; j++) {
                if (neededOwners[i] == owners[j]) {
                    addressIsOwner = true;
                }
            }
            require(addressIsOwner, "Need an owners list");
        }

        address[] memory confirmedBy;
        pendingTransaction = Withdraw(
            block.timestamp,
            true,
            to,
            confirmedBy,
            neededOwners,
            amount
        );
        emit WithdrawStep(
            WithdrawSteps.INIT,
            block.timestamp,
            pendingTransaction.to,
            pendingTransaction.confirmedBy,
            pendingTransaction.neededOwners,
            pendingTransaction.amount
        );
    }

    function confirmWithdraw() public onlyOwner {
        require(
            pendingTransaction.pending,
            "No pending transaction to confirmed"
        );
        for (uint256 i = 0; i < pendingTransaction.confirmedBy.length; i++) {
            require(
                pendingTransaction.confirmedBy[i] != msg.sender,
                "Already confirmed"
            );
            bool addressIsRequired = false;
            for (
                uint256 j = 0;
                j < pendingTransaction.neededOwners.length;
                j++
            ) {
                if (msg.sender == pendingTransaction.neededOwners[j]) {
                    addressIsRequired = true;
                }
            }
            require(addressIsRequired, "Address not required to confirm");
        }

        pendingTransaction.confirmedBy.push(msg.sender);
        emit WithdrawStep(
            WithdrawSteps.CONFIRMED,
            block.timestamp,
            pendingTransaction.to,
            pendingTransaction.confirmedBy,
            pendingTransaction.neededOwners,
            pendingTransaction.amount
        );

        if (
            pendingTransaction.confirmedBy.length ==
            pendingTransaction.neededOwners.length
        ) {
            execWithdraw(pendingTransaction.to, pendingTransaction.amount);
        }
    }

    function execWithdraw(address to, uint256 amount) private onlyOwner {
        payable(to).transfer(amount);
        emit WithdrawStep(
            WithdrawSteps.EXEC,
            block.timestamp,
            pendingTransaction.to,
            pendingTransaction.confirmedBy,
            pendingTransaction.neededOwners,
            pendingTransaction.amount
        );
        delete pendingTransaction;
    }

    function withdraw(address to, uint256 amount) public payable override {
        revert("disabled");
    }
}
