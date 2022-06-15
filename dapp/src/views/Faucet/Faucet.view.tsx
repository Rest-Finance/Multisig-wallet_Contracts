import { FC } from "react";
import { DarkButton, LightButton } from "../../components";
import { CreateFaucet, InitFaucet, useFaucet, useWeb3 } from "../../hooks";

const Container: FC = () => {
  const {
    funcs: { handleMintToken, handleAddTokenToMetamask },
  } = useFaucet();

  return (
    <div className="py-10 border-y bg-violet-800 px-2">
      <div className="m-auto max-w-5xl">
        <h3 className="text-2xl text-center mb-2">Rest Token Faucet</h3>
        <p className="text-center text-sm mb-4">
          Because this dApp use the Avalanche Fuji Network (testnet), you will
          need to own ERC20 tokens to interact with multisig wallets. That's why
          we released this faucet for you to claim free REST tokens.
        </p>
        <div className="md:flex justify-center items-center">
          <div className="mb-2 md:mb-0 md:mr-1 md:w-1/2">
            <LightButton text="Mint 100 REST" onClick={handleMintToken} />
          </div>
          <div className="md:ml-1 md:w-1/2">
            <DarkButton
              text="Add REST to Metamask"
              onClick={handleAddTokenToMetamask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Faucet: FC = () => {
  const { account } = useWeb3();

  return (
    <CreateFaucet.Provider value={InitFaucet(account)}>
      <Container />
    </CreateFaucet.Provider>
  );
};
