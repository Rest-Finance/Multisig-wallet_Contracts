import { FC } from "react";
import { useWeb3 } from "../../hooks";
import { WalletDashboard } from "./WalletDashboard.view";

type WalletRowType = {
  contract: {
    address: string;
    owners: string[];
    balances: { address: string; name: string; balance: number }[];
  };
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
      <div className="flex items-center p-2 border-b border-slate-300">
        <a
          className="w-1/4"
          href={`https://testnet.snowtrace.io/address/${contract.address}`}
          target="_blank"
        >
          {formatAddress(contract.address)}
        </a>
        <div className="w-1/4 overflow-hidden text-center border-x border-slate-200">
          {contract.owners.map((owner) => (
            <a
              key={owner}
              href={`https://testnet.snowtrace.io/address/${owner}`}
              target="_blank"
              className="block"
            >
              {formatAddress(owner)}
            </a>
          ))}
        </div>
        <div className="w-1/4">
          {contract.balances.map((balance) => (
            <p key={balance.address} className="text-center">
              {balance.balance} {balance.name}
            </p>
          ))}
        </div>
        <p className="w-1/4 my-2 text-right text-slate-200 cursor-pointer">
          <span
            className="border border-violet-600 bg-violet-600 rounded p-2"
            onClick={() => setSelectedRow(i)}
          >
            Show / Edit
          </span>
        </p>
      </div>
      <WalletDashboard isRowSelected={selectedRow == i} contract={contract} />
    </div>
  );
};
