import { FC, useEffect, useState } from "react";
import { IMultisig, useWeb3 } from "../../hooks";
import { AddOwnerForm } from "./components/AddOwnerForm.component";
import { PendingOwner } from "./PendingOwner.view";
import {IoCloseSharp} from 'react-icons/io5'

type WalletDashboardType = {
  isRowSelected: boolean;
  contract: IMultisig;
  closeModal: () => void;
};

export const WalletDashboard: FC<WalletDashboardType> = ({
  isRowSelected,
  contract,
  closeModal,
}) => {
  const [pendingOwners, setPendingOwners] = useState<any>([]);

  const {
    funcs: { handleGetPendingOwners },
  } = useWeb3();

  useEffect(() => {
    const getPendingOwners = async () => {
      setPendingOwners(await handleGetPendingOwners(contract.address));
    };
    if (isRowSelected) getPendingOwners();
  }, [isRowSelected]);

  return (
    <div className="absolute rounded-lg top-0 inset-x-0.5 z-10 shadow-lg shadow-zinc-600">
      <div
        className={`relative ${
          isRowSelected ? "block" : "hidden"
        } bg-zinc-700 text-slate-200 p-5 rounded-lg`}
      >
        <span
          onClick={closeModal}
          className="absolute top-0 right-0 mt-1 mr-1 cursor-pointer"
        >
          <IoCloseSharp size={20} />
        </span>
        <p className="mb-2 text-center">
          <span className="font-bold text-2xl underline">
            Smart contract address
          </span>
          {" : "}
          {contract.address}
        </p>
        <h3 className="font-bold text-xl mt-10 underline mb-2">Owners: </h3>
        <ul>
          {contract.owners.map((owner, i: number) => (
            <li className="block">
              {i + 1} - {owner}
            </li>
          ))}
        </ul>

        <AddOwnerForm contract={contract} setPendingOwners={setPendingOwners} />

        <div className="mt-2">
          <h3 className="font-bold text-xl mt-10 underline mb-2">
            Pending owners:
          </h3>
          <div className="flex flex-wrap">
            {pendingOwners
              .filter(
                ({ ownerAddress }: { ownerAddress: string }) =>
                  !ownerAddress.includes("0x00000000")
              )
              .map(
                (pendingOwner: {
                  approvedBy: string[];
                  neededOwners: string[];
                  ownerAddress: string;
                  from: string;
                  at: Date;
                }) => (
                  <PendingOwner
                    pendingOwner={pendingOwner}
                    contract={contract}
                    setPendingOwners={setPendingOwners}
                  />
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
