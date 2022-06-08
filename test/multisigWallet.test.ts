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
    multisig.on("NewPendingOwner", (props) => console.log(props));

    const [owner, bob, alice] = await ethers.getSigners();
    const events = (
      await (await multisig.initNewOwner(bob.address, [owner.address])).wait()
    ).events as any[];

    expect(events[0].event).to.equal("AllowOwnerStep");
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.length).to.be.greaterThan(0);
    expect(events[0].args[0]).to.equal(owner.address);
    expect(events[0].args[3]).to.equal(bob.address);
    expect(events[0].args[1]).to.equal(0);
  });

  it("Request new owner but failed because new owner already a owner", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const provider = ethers.provider;
    multisig.on("NewPendingOwner", (props) => console.log(props));
    const [owner, bob, alice] = await ethers.getSigners();

    try {
      expect(
        await multisig.initNewOwner(owner.address, [owner.address])
      ).to.throw("");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Address already an owner'"
      );
    }
  });

  it("Request new owner but failed because needed owner is not an owner", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const provider = ethers.provider;
    multisig.on("NewPendingOwner", (props) => console.log(props));
    const [owner, bob, alice] = await ethers.getSigners();

    try {
      expect(
        await multisig.initNewOwner(bob.address, [alice.address])
      ).to.throw("");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Need a list of owner'"
      );
    }
  });

  it("Confirm new owner", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const provider = ethers.provider;

    const [owner, bob, alice] = await ethers.getSigners();
    await multisig.initNewOwner(bob.address, [owner.address]);
    const events = (await (await multisig.confirmNewOwner(bob.address)).wait())
      .events as any[];

    expect(events[0].event).to.equal("AllowOwnerStep");
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.length).to.be.greaterThan(0);
    expect(events[0].args[4].length).to.equal(1);
    expect(events[0].args[4][0]).to.equal(owner.address);
    expect(events[0].args[4].length).to.equal(events[0].args[5].length);
    expect(events[0].args[1]).to.equal(1);
  });

  it("Exec new owner", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const provider = ethers.provider;

    const [owner, bob, alice] = await ethers.getSigners();
    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    const events = (await (await multisig.execNewOwner(bob.address)).wait())
      .events as any[];

    expect(events[0].event).to.equal("AllowOwnerStep");
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.length).to.be.greaterThan(0);
    expect(events[0].args[4].length).to.equal(events[0].args[5].length);
    expect(events[0].args[1]).to.equal(2);
  });
});
