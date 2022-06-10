import { ethers } from "hardhat";

async function main() {
  const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.deploy();
  await multisig.deployed();
  console.log("MultisigWallet deployed to:", multisig.address);

  const FactoryWallets = await ethers.getContractFactory("FactoryWallets");
  const factory = await FactoryWallets.deploy();
  await factory.deployed();
  console.log("FactoryWallets deployed to:", factory.address);

  await factory.setRefContractAddress(multisig.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
