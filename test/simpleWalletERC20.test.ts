import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

const abi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

const erc20Token1 = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const getContractBalance = async (contract: Contract, address: string) => {
  const contractBalance = await contract.balanceOf(address);

  return parseFloat(ethers.utils.formatEther(contractBalance));
};

describe("SimpleWalletERC20", function () {
  it("should withdraw erc20 token", async function () {
    const SimpleWalletERC20 = await ethers.getContractFactory(
      "SimpleWalletERC20"
    );
    const simpleWalletERC20 = await SimpleWalletERC20.deploy();
    await simpleWalletERC20.deployed();
    const provider = ethers.provider;
    const [owner, bob] = await ethers.getSigners();
    const FakeErc20 = await ethers.getContractFactory("FakeERC20");
    const fakeErc20 = await FakeErc20.deploy();
    await fakeErc20.deployed();
    await fakeErc20.transfer(
      simpleWalletERC20.address,
      ethers.utils.parseEther("10")
    );
    await fakeErc20.balanceOf(simpleWalletERC20.address);

    expect(
      await getContractBalance(fakeErc20, simpleWalletERC20.address)
    ).to.equal(10);

    await simpleWalletERC20.withdrawERC20(
      fakeErc20.address,
      bob.address,
      ethers.utils.parseEther("5")
    );

    expect(
      await getContractBalance(fakeErc20, simpleWalletERC20.address)
    ).to.equal(5);
  });
});
