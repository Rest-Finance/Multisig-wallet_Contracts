import { FC, useState } from "react";
import { useWeb3 } from "../../hooks";
import { CreateMultisigButton } from "./components";
import { WalletRow } from "./WalletRow.view";

export const WalletsTable: FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const { account, contracts } = useWeb3();

  return (
    <div className="min-h-screen p-5 m-auto max-w-5xl">
      {account && (
        <div>
          <div>
            <CreateMultisigButton />
            <div className="my-3">
              <div className="flex text-violet-600 my-4 text-xl bg-slate-300 rounded p-2">
                <p className="w-1/4">Wallet address</p>
                <p className="w-1/4 border-x border-violet-600 text-center">
                  Owners addresses
                </p>
                <p className="w-1/4 text-center">Balances</p>
                <p className="w-1/4"></p>
              </div>
              {contracts.map((contract, i) => (
                <WalletRow
                  contract={contract}
                  i={i}
                  selectedRow={selectedRow}
                  setSelectedRow={setSelectedRow}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
