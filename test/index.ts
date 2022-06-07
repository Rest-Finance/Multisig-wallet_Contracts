import { expect } from "chai";
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

describe("SimpleWallet", function () {
  it("Should transfer ethers from contract", async function () {
    const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
    const simpleWallet = await SimpleWallet.deploy();
    await simpleWallet.deployed();

    const provider = ethers.provider;
    const [owner, bob] = await ethers.getSigners();
    await simpleWallet.deposit({
      value: ethers.utils.parseEther("1"),
    });
    const initBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    await simpleWallet.withdraw(bob.address, ethers.utils.parseEther("0.5"));
    const finalBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );

    expect(finalBalance - initBalance).to.equal(0.5);
  });

  it("Should not transfer ethers from contract if sender is not owner", async function () {
    const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
    const simpleWallet = await SimpleWallet.deploy();
    await simpleWallet.deployed();

    const provider = ethers.provider;
    const [owner, bob] = await ethers.getSigners();
    await simpleWallet.deposit({
      value: ethers.utils.parseEther("1"),
    });
    const initBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    try {
      await simpleWallet
        .connect(bob)
        .withdraw(bob.address, ethers.utils.parseEther("0.5"));
    } catch (e) {
      console.log(e);
    }
    const finalBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );

    expect(finalBalance - initBalance).to.lessThan(0);
  });

  it("Should add a owner", async function () {
    const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
    const simpleWallet = await SimpleWallet.deploy();
    await simpleWallet.deployed();

    const provider = ethers.provider;
    const [owner, bob] = await ethers.getSigners();
    await simpleWallet.deposit({
      value: ethers.utils.parseEther("1"),
    });
    const initBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    await simpleWallet.addOwner(bob.address);
    try {
      await simpleWallet
        .connect(bob)
        .withdraw(bob.address, ethers.utils.parseEther("0.5"));
    } catch (e) {
      console.log(e);
    }
    const finalBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );

    expect(finalBalance - initBalance).to.be.greaterThan(0);
  });

  it("Should not add a owner", async function () {
    const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
    const simpleWallet = await SimpleWallet.deploy();
    await simpleWallet.deployed();

    const provider = ethers.provider;
    const [owner, bob] = await ethers.getSigners();
    await simpleWallet.deposit({
      value: ethers.utils.parseEther("1"),
    });
    const initBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    try {
      await simpleWallet.connect(bob).addOwner(bob.address);

      await simpleWallet
        .connect(bob)
        .withdraw(bob.address, ethers.utils.parseEther("0.5"));
    } catch (e) {
      console.log(e);
    }
    const finalBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    // const erc20 = new ethers.Contract(erc20Token1, abi, provider);

    // console.log(await erc20.balanceOf("0x55817BD36C2aA7A7906180cF5D6e7D6DD8241b55"));
    expect(finalBalance - initBalance).to.be.lessThan(0);
  });
});
