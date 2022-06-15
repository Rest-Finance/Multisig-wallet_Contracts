import { ethers } from "ethers";
import { provider, tokens } from "../web3.utils";
import restTokenAbi from "./restToken.abi";

export const mintRestToken = async (account: string): Promise<void> => {
  const token = tokens.find(({ name }) => name === "REST");
  if (token) {
    const tokenContract = new ethers.Contract(
      token?.address,
      restTokenAbi,
      provider.getSigner(account)
    );
    await tokenContract.faucet(account);
  }
};

export const addTokenToMetamask = async (): Promise<void> => {
  const token = tokens.find(({ name }) => name === "REST");
  if (token)
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0x951AD67A75D520c11FD08F98Cb148cc2dD0f8b8A", // The address that the token is at.
          symbol: "REST",
          decimals: 18,
        },
      }, 
    });
};
