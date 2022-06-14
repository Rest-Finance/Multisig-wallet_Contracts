import { ethers } from "hardhat";
import ERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

async function main() {
  const RestToken = await ethers.getContractFactory("RestToken");
  const restToken = await RestToken.deploy();
  await restToken.deployed();
  console.log("REST Token deployed to:", restToken.address);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
