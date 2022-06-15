import { FC } from "react";
import { DarkButton, LightButton } from "../../components";
import { useWeb3 } from "../../hooks";

export const Faucet: FC = () => {
    const {
        funcs: {
          handleMintToken,
          handleAddTokenToMetamask,
        },
      } = useWeb3();
      
      return (
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
  );
};
