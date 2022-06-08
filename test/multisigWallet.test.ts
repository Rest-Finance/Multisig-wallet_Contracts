import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("MultisigWallet", function () {
  it("should not init withdraw because last init is too close", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);
    await multisig.initWithdraw(
      ethers.utils.parseEther("1"),
      bob.address,
      [owner.address, bob.address],
      testToken.address
    );
    try {
      await multisig.initWithdraw(
        ethers.utils.parseEther("1"),
        bob.address,
        [owner.address, bob.address],
        testToken.address
      );
    } catch (e) {
      expect(
        (e as Error).message.includes(
          "Need at least 10minutes before each withdraw initialization"
        )
      ).to.equal(true);
    }
  });

  it("should not init withdraw because it needs at least two signers to confirm", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);
    try {
      await multisig.initWithdraw(
        ethers.utils.parseEther("1"),
        bob.address,
        [owner.address],
        testToken.address
      );
    } catch (e) {
      expect(
        (e as Error).message.includes(
          "Need at least 2 address to confirm the transaction"
        )
      ).to.equal(true);
    }
  });

  it("should init withdraw", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);

    const {
      events: [
        {
          args: [step, _, to, confirmedBy, neededOwners, amount, token],
          event,
        },
      ],
    } = (await (
      await multisig.initWithdraw(
        ethers.utils.parseEther("1"),
        bob.address,
        [owner.address, bob.address],
        testToken.address
      )
    ).wait()) as any;

    expect(event).to.equal("WithdrawStep");
    expect(step).to.equal(0);
    expect(to).to.equal(bob.address);
    expect(confirmedBy.length).to.equal(0);
    expect(neededOwners.length).to.equal(2);
    expect(neededOwners.includes(owner.address)).to.equal(true);
    expect(neededOwners.includes(bob.address)).to.equal(true);
    expect(token).to.equal(testToken.address);
  });

  it("should confirm withdraw", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);
    await multisig.initWithdraw(
      ethers.utils.parseEther("1"),
      bob.address,
      [owner.address, bob.address],
      testToken.address
    );
    const {
      events: [
        {
          args: [step, _, to, confirmedBy, neededOwners, amount, token],
          event,
        },
      ],
    } = (await (await multisig.confirmWithdraw()).wait()) as any;

    expect(event).to.equal("WithdrawStep");
    expect(step).to.equal(1);
    expect(to).to.equal(bob.address);
    expect(confirmedBy.length).to.equal(1);
    expect(neededOwners.length).to.equal(2);
    expect(neededOwners.includes(owner.address)).to.equal(true);
    expect(neededOwners.includes(bob.address)).to.equal(true);
    expect(token).to.equal(testToken.address);
  });

  it("should fail if not all signers confirmed the transaction", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    const initBalance = parseFloat(
      ethers.utils.formatEther(await testToken.balanceOf(bob.address))
    );
    expect(initBalance).to.equal(0);

    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);
    await multisig.initWithdraw(
      ethers.utils.parseEther("1"),
      bob.address,
      [owner.address, bob.address],
      testToken.address
    );
    await multisig.connect(bob).confirmWithdraw();

    try {
      await multisig.execWithdraw();
    } catch (e) {
      expect((e as Error).message.includes("Confirmation step not over")).to.equal(true);
    }

    const endBalance = parseFloat(
      ethers.utils.formatEther(await testToken.balanceOf(bob.address))
    );

    expect(endBalance).to.be.equal(0);
  });

  it("should withdraw", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();
    const [owner, bob] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory("FakeERC20");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
    const initBalance = parseFloat(
      ethers.utils.formatEther(await testToken.balanceOf(bob.address))
    );
    expect(initBalance).to.equal(0);

    await multisig.initNewOwner(bob.address, [owner.address]);
    await multisig.confirmNewOwner(bob.address);
    await multisig.execNewOwner(bob.address);
    await multisig.initWithdraw(
      ethers.utils.parseEther("1"),
      bob.address,
      [owner.address, bob.address],
      testToken.address
    );
    await multisig.confirmWithdraw();
    await multisig.connect(bob).confirmWithdraw();
    const {
      events: [
        _,
        {
          args: [step, date, to, confirmedBy, neededOwners, amount, token],
          event,
        },
      ],
    } = (await (await multisig.execWithdraw()).wait()) as any;

    expect(event).to.equal("WithdrawStep");
    expect(step).to.equal(2);
    expect(to).to.equal(bob.address);
    expect(confirmedBy.length).to.equal(2);
    expect(neededOwners.length).to.equal(2);
    expect(neededOwners.includes(owner.address)).to.equal(true);
    expect(neededOwners.includes(bob.address)).to.equal(true);
    expect(token).to.equal(testToken.address);

    const endBalance = parseFloat(
      ethers.utils.formatEther(await testToken.balanceOf(bob.address))
    );

    expect(endBalance).to.be.equal(1);
  });
});
