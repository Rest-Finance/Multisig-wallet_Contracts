//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Owners.sol";

contract MultisigWallet is Owners {
    struct Withdraw {
        uint256 at;
        bool pending;
        address to;
        address[] confirmedBy;
        address[] neededOwners;
        uint256 amount;
        address token;
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
        uint256 amount,
        address token
    );

    function initWithdraw(
        uint256 amount,
        address to,
        address[] memory neededOwners,
        address token
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
            amount,
            token
        );
        emit WithdrawStep(
            WithdrawSteps.INIT,
            block.timestamp,
            pendingTransaction.to,
            pendingTransaction.confirmedBy,
            pendingTransaction.neededOwners,
            pendingTransaction.amount,
            pendingTransaction.token
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
            pendingTransaction.amount,
            pendingTransaction.token
        );
    }

    function execWithdraw() public onlyOwner {
        require(
            pendingTransaction.confirmedBy.length ==
                pendingTransaction.neededOwners.length,
            "Confirmation step not over"
        );
        ERC20(pendingTransaction.token).transfer(
            pendingTransaction.to,
            pendingTransaction.amount
        );
        emit WithdrawStep(
            WithdrawSteps.EXEC,
            block.timestamp,
            pendingTransaction.to,
            pendingTransaction.confirmedBy,
            pendingTransaction.neededOwners,
            pendingTransaction.amount,
            pendingTransaction.token
        );
        delete pendingTransaction;
    }
}
