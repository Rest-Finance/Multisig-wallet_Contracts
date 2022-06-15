import { BigNumber, BigNumberish, ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  connectToNetwork,
  createWallet,
  getContractsData,
  getAccount,
  Steps,
  mintRestToken,
  getContractData,
  addTokenToMetamask,
  IContractData,
  getPendingOwners,
  addAOwner,
  approveOwner,
  execOwner,
} from "./web3.utils";

interface IPendingOwner {
  at?: Date;
  approvedBy?: string[];
  from?: string;
  neededOwners?: string[];
  ownerAddress?: string;
}

interface IWeb3 {
  account?: string;
  contracts: IContractData[];
  creatingWalletStep: Steps;
  funcs: {
    handleOnConnect: () => Promise<void>;
    handleCreateWallet: () => Promise<void>;
    handleMintToken: () => Promise<void>;
    handleAddTokenToMetamask: () => Promise<void>;
    formatAddress: (address: string) => string;
    handleGetPendingOwners: (
      contractAddress: string
    ) => Promise<IPendingOwner[]>;
    handleAddAOwner: (
      contractAddress: string,
      to: string,
      neededOwners: string[]
    ) => Promise<void>;
    handleApproveOwner: (contractAddress: string, to: string) => Promise<void>;
    handleExecOwner: (contractAddress: string, to: string) => Promise<void>;
  };
}

const initialState = {
  contracts: [],
  creatingWalletStep: Steps.START,
  funcs: {
    handleOnConnect: async () => {},
    handleCreateWallet: async () => {},
    handleMintToken: async () => {},
    handleAddTokenToMetamask: async () => {},
    formatAddress: (address: string) => "",
    handleGetPendingOwners: async () => [],
    handleAddAOwner: async (
      contractAddress: string,
      to: string,
      neededOwners: string[]
    ) => {},
    handleApproveOwner: async (contractAddress: string, to: string) => {},
    handleExecOwner: async (contractAddress: string, to: string) => {}, 
  },
};

export const CreateWeb3 = createContext<IWeb3>(initialState);

export const useWeb3 = () => {
  return useContext(CreateWeb3);
};

export const InitWeb3 = () => {
  const [account, setAccount] = useState<string>();
  const [contracts, setContracts] = useState<IContractData[]>([]);
  const [creatingWalletStep, setCreatingWalletStep] = useState<Steps>(
    Steps.START
  );

  const accountsChanged = (newAccount: string): void => {
    setAccount(newAccount);
  };

  const chainChanged = (): void => {
    setAccount(undefined);
  };

  const handleOnConnect = async (): Promise<void> => {
    if (window.ethereum) {
      try {
        await connectToNetwork();
        const newAccount = await getAccount();
        accountsChanged(newAccount);
        if (account) getContractsData(account, contracts, setContracts);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateWallet = async (): Promise<void> => {
    if (account) {
      const multisig = await createWallet(account, setCreatingWalletStep);
      if (multisig) {
        const contractData = await getContractData(account, multisig);
        if (multisig) setContracts([...contracts, contractData]);
      }
    }
  };

  const handleMintToken = async (): Promise<void> => {
    if (!window.ethereum || !account) toast("You need to connect first !");
    if (account) await mintRestToken(account);
  };

  const handleAddTokenToMetamask = async (): Promise<void> => {
    if (!window.ethereum || !account) toast("You need to connect first !");
    if (account) await addTokenToMetamask(account);
  };

  const formatAddress = (address: string) => {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address.match(truncateRegex);
    if (!match) return address;

    return `${match[1]}…${match[2]}`;
  };

  const handleGetPendingOwners = async (
    contractAddress: string
  ): Promise<IPendingOwner[]> => {
    if (account) {
      const pendingOwners = await getPendingOwners(contractAddress, account);
      if (pendingOwners.length)
        return pendingOwners.map(
          ([at, from, ownerAddress, approvedBy, neededOwners]:
            | string[]
            | string[][]
            | BigNumberish[]) => ({
            at: new Date(parseInt(at.toString()) * 1000),
            approvedBy,
            from,
            neededOwners,
            ownerAddress,
          })
        );
    }
    return [];
  };

  const handleAddAOwner = async (
    contractAddress: string,
    to: string,
    neededOwners: string[]
  ) => {
    if (account) {
      const pendingOwners = await addAOwner(
        contractAddress,
        account,
        to,
        neededOwners
      );
      console.log(pendingOwners);
    }
  };

  const handleApproveOwner = async (contractAddress: string, to: string) => {
    if (account) {
      const pendingOwners = await approveOwner(contractAddress, account, to);
      console.log(pendingOwners);
    }
  };

  const handleExecOwner = async (contractAddress: string, to: string) => {
    if (account) {
      const pendingOwners = await execOwner(contractAddress, account, to);
      console.log(pendingOwners);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const initAccount = async () => {
        const account = await getAccount();
        accountsChanged(account);
        await getContractsData(account, contracts, setContracts);
      };
      window.ethereum.on("accountsChanged", accountsChanged);
      window.ethereum.on("chainChanged", chainChanged);
      initAccount();
    }
  }, []);

  return {
    funcs: {
      handleOnConnect,
      handleCreateWallet,
      handleMintToken,
      handleAddTokenToMetamask,
      formatAddress,
      handleGetPendingOwners,
      handleAddAOwner,
      handleApproveOwner,
      handleExecOwner,
    },
    account,
    contracts,
    creatingWalletStep,
  };
};
