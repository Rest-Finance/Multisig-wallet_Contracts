import { ethers } from "ethers";
import erc20Abi from "../erc20.abi";
import factoryAbi from "../factoryAbi";
import multisigAbi from "../multisigAbi";
import { factoryAddress, tokens, provider } from "./utils.web3";

export enum Steps {
  START = "start",
  CONFIRM = "confirm",
  VALIDATE = "validate",
}

export interface IContractData {
  address: string;
  owners: string[];
  balances: {
    name: string;
    address: string;
    balance: number;
  }[];
}

export const connectToNetwork = async () => {
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0xA869",
        chainName: "Avalanche Testnet C-Chain",
        nativeCurrency: {
          name: "Avalanche",
          symbol: "AVAX",
          decimals: 18,
        },
        rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://testnet.snowtrace.io/"],
      },
    ],
  });
};

export const createWallet = async (
  account: string | undefined,
  setStep: (step: Steps) => void
): Promise<string | undefined> => {
  setStep(Steps.START);
  if (account) {
    setStep(Steps.CONFIRM);
    const f = new ethers.Contract(
      factoryAddress,
      factoryAbi,
      provider.getSigner(account)
    );
    const creating = await f.newContract();
    setStep(Steps.VALIDATE);
    const {
      events: [
        {
          args: [multisig],
        },
      ],
    } = await creating.wait();
    setStep(Steps.START);

    return multisig;
  }
};

export const getContracts = async (account: string): Promise<string[]> => {
  const f = new ethers.Contract(
    factoryAddress,
    factoryAbi,
    provider.getSigner(account)
  );
  const multisigs = await f.getUserContracts();

  return multisigs;
};

export const getAccount = async (): Promise<string> => {
  const [newAccount] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return newAccount;
};

export const getContractData = async (
  account: string,
  contract: string
): Promise<IContractData> => {
  const multisig = new ethers.Contract(
    contract,
    multisigAbi,
    provider.getSigner(account)
  );
  const owners = await multisig.getOwners();
  const balances = [];
  for await (const token of tokens) {
    const tokenContract = new ethers.Contract(
      token?.address,
      erc20Abi,
      provider.getSigner(account)
    );
    const balance = parseFloat(
      ethers.utils.formatEther(await tokenContract.balanceOf(contract))
    );
    if (balance > 0)
      balances.push({ name: token.name, address: token.address, balance });
  }

  return { address: contract, owners, balances };
};

export const getContractsData = async (
  account: string,
  contracts: IContractData[],
  setContracts: (contracts: IContractData[]) => void
) => {
  if (account) {
    const contractsAddresses = await getContracts(account);
    const contractsData = [];
    for await (const contractAddress of contractsAddresses) {
      if (account)
        contractsData.push(await getContractData(account, contractAddress));
    }
    setContracts(contractsData);
  }
};

export const getPendingOwners = async (
  contractAddress: string,
  account: string
) => {
  const contract = new ethers.Contract(
    contractAddress,
    multisigAbi,
    provider.getSigner(account)
  );

  return await contract.getPendingOwners();
};

export const addOwner = async (
  contractAddress: string,
  account: string,
  to: string,
  neededOwners: string[]
) => {
  const contract = new ethers.Contract(
    contractAddress,
    multisigAbi,
    provider.getSigner(account)
  );
  const call = await contract.initNewOwner(to, neededOwners);
  await call.wait();
  return await getPendingOwners(contractAddress, account);
};

export const approveOwner = async (
  contractAddress: string,
  account: string,
  to: string
) => {
  const contract = new ethers.Contract(
    contractAddress,
    multisigAbi,
    provider.getSigner(account)
  );
  const call = await contract.confirmNewOwner(to);
  await call.wait();
  return await getPendingOwners(contractAddress, account);
};

export const execOwner = async (
  contractAddress: string,
  account: string,
  to: string
) => {
  const contract = new ethers.Contract(
    contractAddress,
    multisigAbi,
    provider.getSigner(account)
  );
  const call = await contract.execNewOwner(to);
  await call.wait();
  return await getPendingOwners(contractAddress, account);
};
