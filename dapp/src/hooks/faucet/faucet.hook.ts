import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { addTokenToMetamask, mintRestToken } from "./faucet.web3";

interface IFaucet {
  funcs: {
    handleAddTokenToMetamask: () => Promise<void>;
    handleMintToken: () => Promise<void>;
  };
}

const initialState = {
  funcs: {
    handleAddTokenToMetamask: async () => {},
    handleMintToken: async () => {},
  },
};

export const CreateFaucet = createContext<IFaucet>(initialState);

export const useFaucet = () => {
  return useContext(CreateFaucet);
};

export const InitFaucet = (account?: string) => {
  const handleMintToken = async (): Promise<void> => {
    if (!window.ethereum || !account) toast("You need to connect first !");
    if (account) await mintRestToken(account);
  };

  const handleAddTokenToMetamask = async (): Promise<void> => {
    if (!window.ethereum || !account) toast("You need to connect first !");
    if (account) await addTokenToMetamask();
  };

  return { funcs: { handleAddTokenToMetamask, handleMintToken } };
};
