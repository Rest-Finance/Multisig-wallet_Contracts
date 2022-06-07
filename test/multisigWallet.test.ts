import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("MultisigWallet", function () {
  // it("should not withdraw if all owners not confirmed the transaction", async function () {
  //   const Multisig = await ethers.getContractFactory("MultisigWallet");
  //   const multisig = await Multisig.deploy();
  //   await multisig.deployed();
  //   const provider = ethers.provider;

  //   const [owner, bob] = await ethers.getSigners();
  //   const initBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   await multisig.deposit({ value: ethers.utils.parseEther("1") });
  //   await multisig.addOwner(bob.address);
  //   await multisig.initWithdraw(ethers.utils.parseEther("0.5"), bob.address);

  //   const finalBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   expect(finalBalance - initBalance).to.be.equal(0);
  // });

  // it("should not withdraw because an owner can't confirm twice", async function () {
  //   const Multisig = await ethers.getContractFactory("MultisigWallet");
  //   const multisig = await Multisig.deploy();
  //   await multisig.deployed();
  //   const provider = ethers.provider;

  //   const [owner, bob] = await ethers.getSigners();
  //   const initBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   await multisig.deposit({ value: ethers.utils.parseEther("1") });
  //   await multisig.addOwner(bob.address);
  //   await multisig.initWithdraw(ethers.utils.parseEther("0.5"), bob.address);
  //   try {
  //     await multisig.confirm();
  //   } catch (e) {
  //     console.log(e);
  //   }

  //   const finalBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   expect(finalBalance - initBalance).to.be.equal(0);
  // });

  // it("should withdraw when all owners confirm the transaction", async function () {
  //   const Multisig = await ethers.getContractFactory("MultisigWallet");
  //   const multisig = await Multisig.deploy();
  //   await multisig.deployed();
  //   const provider = ethers.provider;

  //   const [owner, bob] = await ethers.getSigners();
  //   const initBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   await multisig.deposit({ value: ethers.utils.parseEther("1") });
  //   await multisig.addOwner(bob.address);
  //   await multisig.initWithdraw(ethers.utils.parseEther("0.5"), bob.address);
  //   await multisig.connect(bob).confirm();
  //   console.log(await multisig.pendingTransaction())

  //   const finalBalance = parseFloat(
  //     ethers.utils.formatEther(await provider.getBalance(bob.address))
  //   );
  //   console.log(await multisig.pendingTransaction())
  //   expect(finalBalance - initBalance).to.be.greaterThan(0);
  // });

  // it("should get pending transaction", async function () {
  //   const Multisig = await ethers.getContractFactory("MultisigWallet");
  //   const multisig = await Multisig.deploy();
  //   await multisig.deployed();
  //   const provider = ethers.provider;

  //   const [owner, bob] = await ethers.getSigners();

  //   await multisig.initWithdraw(ethers.utils.parseEther("0.5"), bob.address);

  //   const response = await multisig.pendingTransaction()
  // });

  it("Request new owner", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const provider = ethers.provider;

    const [owner, bob, alice] = await ethers.getSigners();
    const initBalance = parseFloat(
      ethers.utils.formatEther(await provider.getBalance(bob.address))
    );
    await multisig.deposit({ value: ethers.utils.parseEther("1") });

    await multisig.requestNewOwner(bob.address, [owner.address]);
    // const response = await multisig.allowOwner(bob.address);
    console.log(await multisig.getOwners());

    await multisig.requestNewOwner(alice.address, [bob.address, owner.address]);
    await multisig.allowOwner(alice.address);
    await multisig.connect(bob).allowOwner(alice.address);

    console.log(await multisig.getOwners());
  });
});
