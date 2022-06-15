import { FC } from "react";
import { MainButton } from "../../components";
import { IMultisig, useWeb3 } from "../../hooks";
import { WalletDashboard } from "./WalletDashboard.view";
import { IoChevronForwardOutline } from "react-icons/io5";

type WalletRowType = {
  contract: IMultisig;
  i: number;
  selectedRow: number;
  setSelectedRow: (row: number) => void;
};

export const WalletRow: FC<WalletRowType> = ({
  contract,
  i,
  selectedRow,
  setSelectedRow,
}) => {
  const {
    funcs: { formatAddress },
  } = useWeb3();

  return (
    <div key={contract.address}>
      <div className={`flex md:flex-row  my-4`}>
        <div className="md:hidden flex justify-between md:justify-center flex-col text-violet-600 md:text-xl bg-slate-300 rounded p-2 w-1/4 md:w-full">
          <p className="w-full md:w-1/4 h-12 md:h-full flex justify-center items-center text-center md:block">
            Wallet address
          </p>
          <p className="w-full md:w-1/4 h-24 md:h-full flex justify-center items-center text-center md:block">
            Owners addresses
          </p>
          <p className="w-full md:w-1/4 h-24 md:h-full flex justify-center items-center text-center md:block">
            Balances
          </p>
          <p className="w-full md:w-1/4 h-12 md:h-full flex items-center text-center md:block"></p>
        </div>
        <div className="flex items-center flex-col justify-between md:justify-center md:flex-row border-b border-slate-300 p-2 w-3/4 md:w-full">
          <a
            className="w-full md:w-1/4 h-12 md:h-full flex items-center justify-center"
            href={`https://testnet.snowtrace.io/address/${contract.address}`}
            target="_blank"
          >
            {formatAddress(contract.address)}{" "}
            <IoChevronForwardOutline className="text-violet-500" />
          </a>
          <div className="w-full md:w-1/4 h-24 md:h-full overflow-hidden md:text-center md:border-x border-slate-200 flex justify-center flex-col items-center md:block">
            {contract.owners.map((owner) => (
              <a
                key={owner}
                href={`https://testnet.snowtrace.io/address/${owner}`}
                target="_blank"
                className="flex justify-center items-center"
              >
                {formatAddress(owner)}{" "}
                <IoChevronForwardOutline className="text-violet-500" />
              </a>
            ))}
          </div>
          <div className="w-full md:w-1/4 h-24 md:h-full flex justify-center items-center">
            {contract.balances.map((balance) => (
              <p key={balance.address} className="text-center">
                {balance.balance} {balance.name}
              </p>
            ))}
          </div>
          <p className="w-full md:w-1/4 h-12 md:h-full my-2 md:text-right text-slate-200 cursor-pointer">
            <MainButton
              onClick={async () => setSelectedRow(selectedRow == i ? -1 : i)}
              text="Show / Edit"
            />
          </p>
        </div>
      </div>
    </div>
  );
};
