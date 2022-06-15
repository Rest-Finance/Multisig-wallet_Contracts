import { BigNumberish } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";

import {
  connectToNetwork,
  createWallet,
  getContractsData,
  getAccount,
  Steps,
  getContractData,
  IContractData,
  getPendingOwners,
  addOwner,
  approveOwner,
  execOwner,
} from "./web3.utils";

export interface IPendingOwner {
  at: Date;
  approvedBy: string[];
  from: string;
  neededOwners: string[];
  ownerAddress: string;
}

export interface IMultisig {
  address: string;
  owners: string[];
  balances: { address: string; name: string; balance: number }[];
}

interface IWeb3 {
  account?: string;
  contracts: IContractData[];
  creatingWalletStep: Steps;
  funcs: {
    handleOnConnect: () => Promise<void>;
    handleCreateWallet: () => Promise<void>;
    formatAddress: (address: string) => string;
    handleGetPendingOwners: (
      contractAddress: string
    ) => Promise<IPendingOwner[]>;
    handleAddOwner: (
      contractAddress: string,
      to: string,
      neededOwners: string[]
    ) => Promise<IPendingOwner[]>;
    handleApproveOwner: (
      contractAddress: string,
      to: string
    ) => Promise<IPendingOwner[]>;
    handleExecOwner: (
      contractAddress: string,
      to: string
    ) => Promise<IPendingOwner[]>;
  };
}

const initialState = {
  contracts: [],
  creatingWalletStep: Steps.START,
  funcs: {
    handleOnConnect: async () => {},
    handleCreateWallet: async () => {},
    formatAddress: (address: string) => "",
    handleGetPendingOwners: async () => [],
    handleAddOwner: async (
      contractAddress: string,
      to: string,
      neededOwners: string[]
    ) => [],
    handleApproveOwner: async (contractAddress: string, to: string) => [],
    handleExecOwner: async (contractAddress: string, to: string) => [],
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

  const handleAddOwner = async (
    contractAddress: string,
    to: string,
    neededOwners: string[]
  ): Promise<IPendingOwner[]> => {
    if (account) {
      return await addOwner(contractAddress, account, to, neededOwners);
    }
    return [];
  };

  const handleApproveOwner = async (
    contractAddress: string,
    to: string
  ): Promise<IPendingOwner[]> => {
    if (account) {
      return await approveOwner(contractAddress, account, to);
    }
    return [];
  };

  const handleExecOwner = async (
    contractAddress: string,
    to: string
  ): Promise<IPendingOwner[]> => {
    if (account) {
      const pendingOwners = await execOwner(contractAddress, account, to);
      await getContractsData(account, contracts, setContracts);
      return pendingOwners;
    }
    return [];
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
      formatAddress,
      handleGetPendingOwners,
      handleAddOwner,
      handleApproveOwner,
      handleExecOwner,
    },
    account,
    contracts,
    creatingWalletStep,
  };
};
