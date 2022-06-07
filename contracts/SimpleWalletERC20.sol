//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./SimpleWallet.sol";

contract SimpleWalletERC20 is SimpleWallet {
    function withdrawERC20(
        address token_address,
        address to,
        uint256 amount
    ) public payable onlyOwner {
        ERC20(token_address).transfer(to, amount);
    }
}
