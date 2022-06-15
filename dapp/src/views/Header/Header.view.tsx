import { FC } from "react";
import { LightButton } from "../../components";
import { useWeb3 } from "../../hooks";

export const Header: FC = () => {
  const {
    funcs: { handleOnConnect },
    account,
  } = useWeb3();
  return (
    <div className="m-auto max-w-5xl flex justify-between items-center">
      <div>
        <img src="/MULTISIG.png" className="w-52" />
      </div>
      <div className="text-right">
        <LightButton
          onClick={handleOnConnect}
          text={account ? account : "Connect wallet"}
          disabled={!!account}
        />
      </div>
    </div>
  );
};
