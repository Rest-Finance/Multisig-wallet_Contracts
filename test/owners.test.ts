import { expect } from "chai";
import { ethers } from "hardhat";

describe("Owners", function () {
  it("Request new owner", async () => {
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const [owner, bob] = await ethers.getSigners();
    const events = (
      await (await owners.initNewOwner(bob.address, [owner.address])).wait()
    ).events as any[];

    expect(events[0].event).to.equal("AllowOwnerStep");
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.length).to.be.greaterThan(0);
    expect(events[0].args[0]).to.equal(owner.address);
    expect(events[0].args[3]).to.equal(bob.address);
    expect(events[0].args[1]).to.equal(0);
  });

  it("Request new owner but failed because new owner already an owner", async () => {
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const [owner] = await ethers.getSigners();

    try {
      expect(
        await owners.initNewOwner(owner.address, [owner.address])
      ).to.throw("");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Address already an owner'"
      );
    }
  });

  it("Request new owner but failed because needed owner is not an owner", async () => {
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const [owner, bob, alice] = await ethers.getSigners();

    try {
      expect(
        await owners.initNewOwner(bob.address, [alice.address])
      ).to.throw("");
    } catch (e) {
      expect((e as Error).message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'Need a list of owner'"
      );
    }
  });

  it("Confirm new owner", async () => {
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const [owner, bob] = await ethers.getSigners();
    await owners.initNewOwner(bob.address, [owner.address]);
    const events = (await (await owners.confirmNewOwner(bob.address)).wait())
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
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const [owner, bob] = await ethers.getSigners();
    await owners.initNewOwner(bob.address, [owner.address]);
    await owners.confirmNewOwner(bob.address);
    const events = (await (await owners.execNewOwner(bob.address)).wait())
      .events as any[];

    expect(events[0].event).to.equal("AllowOwnerStep");
    expect(events.length).to.be.greaterThan(0);
    expect(events[0].args.length).to.be.greaterThan(0);
    expect(events[0].args[4].length).to.equal(events[0].args[5].length);
    expect(events[0].args[1]).to.equal(2);
  });

  it("should return owners", async () => {
    const Owners = await ethers.getContractFactory("Owners");
    const owners = await Owners.deploy();
    await owners.deployed();
    const response = await owners.getOwners()
    console.log(response);
  })
});
