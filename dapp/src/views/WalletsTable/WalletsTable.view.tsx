import { FC, useState } from "react";
import { useWeb3 } from "../../hooks";
import { CreateMultisigButton } from "./components";
import { WalletRow } from "./WalletRow.view";
import "../../index.css";
import { WalletDashboard } from "./WalletDashboard.view";

export const WalletsTable: FC = () => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const { account, contracts } = useWeb3();

  return (
    <div className={`relative`}>
      {account && (
        <div id={selectedRow >= 0 ? "blur-it" : ""}>
          <div>
            <CreateMultisigButton />
          </div>
          <div className="my-3">
            <div
              className={`hidden md:flex justify-center flex-row text-violet-600 my-4 text-xl bg-slate-300 rounded p-2`}
            >
              <p className="w-1/4 text-center">Wallet address</p>
              <p className="w-1/4 border-x-2 border-violet-600 text-center">
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
      )}
      {selectedRow > -1 && (
        <WalletDashboard
          contract={contracts[selectedRow]}
          closeModal={() => setSelectedRow(-1)}
        />
      )}
    </div>
  );
};
