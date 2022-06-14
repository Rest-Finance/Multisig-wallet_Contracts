import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import factoryAbi from "../factoryAbi";
import multisigAbi from "../multisigAbi";
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
} from "./web3.utils";

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
    },
    account,
    contracts,
    creatingWalletStep,
  };
};
