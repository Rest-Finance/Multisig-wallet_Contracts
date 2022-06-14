import { useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Contract, ethers } from "ethers";
import factoryAbi from "./factoryAbi";
import multisigAbi from "./multisigAbi";
import { DarkButton, LightButton } from "./components";
import { useWeb3 } from "./hooks/web3.hook";
import { Steps } from "./hooks/web3.utils";
import { Header } from "./views";
import { toast, ToastContainer } from "react-toastify";

function App() {
  const {
    funcs: {
      handleCreateWallet,
      handleMintToken,
      handleAddTokenToMetamask,
      formatAddress,
    },
    account,
    creatingWalletStep,
    contracts,
  } = useWeb3();

  const getCreateWalletButtonText = () => {
    switch (creatingWalletStep) {
      case Steps.CONFIRM:
        return "Confirming";
      case Steps.VALIDATE:
        return "Validating";
      default:
        return "Create Multisig wallet";
    }
  };

  return (
    <div className="bg-slate-800 text-slate-200">
      <Header />
      <div className="py-10 border-y bg-violet-800">
        <h3 className="text-2xl text-center mb-2">Rest Token Faucet</h3>
        <p className="text-center text-sm mb-4">
          Because this dApp use the Avalanche Fuji Network (testnet), you will
          need to own ERC20 tokens to interact with multisig wallets. That's why
          we released this faucet for you to claim free REST tokens.
        </p>
        <div className="flex justify-center items-center">
          <div className="mr-1">
            <LightButton text="Mint 100 REST" onClick={handleMintToken} />
          </div>
          <div className="ml-1">
            <DarkButton
              text="Add REST to Metamask"
              onClick={handleAddTokenToMetamask}
            />
          </div>
        </div>
      </div>
      <div className="min-h-screen p-5 m-auto max-w-5xl">
        {account && (
          <div>
            <div>
              <div className="text-right">
                <DarkButton
                  text={getCreateWalletButtonText()}
                  disabled={creatingWalletStep !== Steps.START}
                  onClick={handleCreateWallet}
                />
              </div>
              <div className="my-3">
                <div className="flex text-violet-600 my-4 text-xl bg-slate-300 rounded p-2">
                  <p className="w-1/2">Contract address</p>
                  <p className="w-1/4 border-x border-violet-600 text-center">
                    Owners addressed
                  </p>
                  <p className="w-1/4 text-right">Balances</p>
                </div>
                {contracts.map((contract) => (
                  <div
                    key={contract.address}
                    className="flex p-2 border-b border-slate-300"
                  >
                    <a
                      className="w-1/2"
                      href={`https://testnet.snowtrace.io/address/${contract.address}`}
                      target="_blank"
                    >
                      {formatAddress(contract.address)}
                    </a>
                    <div className="w-1/4 overflow-hidden text-center border-x border-slate-200">
                      {contract.owners.map((owner) => (
                        <a
                          href={`https://testnet.snowtrace.io/address/${owner}`}
                          target="_blank"
                        >
                          {formatAddress(owner)}
                        </a>
                      ))}
                    </div>
                    <div className="w-1/4">
                      {contract.balances.map((balance) => (
                        <p key={balance.address} className="text-right">
                          {balance.balance} {balance.name}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
