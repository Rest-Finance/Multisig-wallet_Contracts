import { FC } from "react";
import { DarkButton } from "../../../components";
import { useWeb3 } from "../../../hooks";
import { Steps } from "../../../hooks/web3.utils";

export const CreateMultisigButton: FC = () => {
  const {
    funcs: { handleCreateWallet },
    creatingWalletStep,
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
    <div className="text-right">
      <DarkButton
        text={getCreateWalletButtonText()}
        disabled={creatingWalletStep !== Steps.START}
        onClick={handleCreateWallet}
      />
    </div>
  );
};
