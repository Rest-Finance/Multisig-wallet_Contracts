import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("FactoryWallets", function () {
  it("should not init withdraw because last init is too close", async () => {
    const Multisig = await ethers.getContractFactory("MultisigWallet");
    const multisig = await Multisig.deploy();
    await multisig.deployed();

    const FactoryWallets = await ethers.getContractFactory("FactoryWallets");
    const factory = await FactoryWallets.deploy();
    await factory.deployed();

    await factory.setRefContractAddress(multisig.address);
    const response = await factory.newContract();
    const {
      events: [
        {
          args: [contractAddress],
        },
      ],
    } = (await response.wait()) as any;
    await factory.newContract();
    await factory.newContract();
    const contracts = await factory.getUserContracts()

    expect(contracts.length).to.be.equal(3)
  });
});
