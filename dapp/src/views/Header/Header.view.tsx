import { FC } from "react";
import { LightButton } from "../../components";
import { useWeb3 } from "../../hooks";

export const Header: FC = () => {
  const {
    funcs: { handleOnConnect },
    account,
  } = useWeb3();
  return (
    <div className="py-5 px-2 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-widest">MULTISIG</h1>
      </div>
      <div className="text-right">
        <LightButton onClick={handleOnConnect} text={account ? account : "Connect wallet"} disabled={!!account} />
      </div>
    </div>
  );
};
