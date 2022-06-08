import { ethers } from "hardhat";

async function main() {
  const MultisigWallet = await ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.deploy();
  await multisig.deployed();
  console.log("MultisigWallet deployed to:", multisig.address);

  const FakeERC20 = await ethers.getContractFactory("FakeERC20");
  const testToken = await FakeERC20.deploy();
  await testToken.deployed();
  console.log("TestToken deployed to:", testToken.address);

  await testToken.transfer(multisig.address, ethers.utils.parseEther("10"));
  const [owner, bob] = await ethers.getSigners();
  const initBalance = parseFloat(
    ethers.utils.formatEther(await testToken.balanceOf(bob.address))
  );
  console.log(`Bob RestToken Balance before withdraw: ${initBalance}REST`);
  console.log("Init new owner");
  const initNewOwner = await multisig.initNewOwner(bob.address, [
    owner.address,
  ]);
  await initNewOwner.wait();
  console.log("Confirm new owner");
  const confirmNewOwner = await multisig.confirmNewOwner(bob.address);
  await confirmNewOwner.wait();
  console.log("Exec new owner");
  const execNewOwner = await multisig.execNewOwner(bob.address);
  await execNewOwner.wait();
  console.log("Init withdraw");
  const initWithdraw = await multisig.initWithdraw(
    ethers.utils.parseEther("1"),
    bob.address,
    [owner.address, bob.address],
    testToken.address
  );
  await initWithdraw.wait();
  console.log("Confirm withdraw using owner");
  const confirmWithdraw = await multisig.confirmWithdraw();
  await confirmWithdraw.wait();
  console.log("Confirm withdraw using Bob");
  const confirmWithdrawBob = await multisig.connect(bob).confirmWithdraw();
  await confirmWithdrawBob.wait();
  console.log("Exec withdraw");
  const execWithdraw = await multisig.execWithdraw();
  await execWithdraw.wait();
  const endBalance = parseFloat(
    ethers.utils.formatEther(await testToken.balanceOf(bob.address))
  );
  console.log(`Bob RestToken Balance after withdraw: ${endBalance}REST`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
