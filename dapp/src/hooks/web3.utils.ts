import { ethers } from "ethers";
import erc20Abi from "../erc20.abi";
import factoryAbi from "../factoryAbi";
import multisigAbi from "../multisigAbi";
import restTokenAbi from "../restToken.abi";

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

export const factoryAddress = "0xa645F946884F434E32923b6FE930a34092BCf4be";
export const tokens = [
  {
    address: "0x951AD67A75D520c11FD08F98Cb148cc2dD0f8b8A",
    name: "REST",
  },
  {
    address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    name: "WAVAX",
  },
];

export const provider = new ethers.providers.Web3Provider(window.ethereum);

export const getBalance = async () => {
  for await (const token of tokens) {
  }
};

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

export const addTokenToMetamask = async (account: string): Promise<void> => {
  const token = tokens.find(({ name }) => name === "REST");
  if (token)
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20", // Initially only supports ERC20, but eventually more!
        options: {
          address: "0x951AD67A75D520c11FD08F98Cb148cc2dD0f8b8A", // The address that the token is at.
          symbol: "REST", // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18, // The number of decimals in the token
        },
      },
    });
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

export const addAOwner = async (
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
  await contract.initNewOwner(to, neededOwners);

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
  await contract.confirmNewOwner(to);

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
  const res = await contract.execNewOwner(to);
  console.log(await res.wait());
  return await getPendingOwners(contractAddress, account);
};
