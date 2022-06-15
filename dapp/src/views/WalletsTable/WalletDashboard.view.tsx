import { FC, useEffect, useState } from "react";
import { LightButton } from "../../components";
import { useWeb3 } from "../../hooks";
import { PendingOwner } from "./PendingOwner.view";

type WalletDashboardType = {
  isRowSelected: boolean;
  contract: {
    address: string;
    owners: string[];
    balances: { address: string; name: string; balance: number }[];
  };
};

export const WalletDashboard: FC<WalletDashboardType> = ({
  isRowSelected,
  contract,
}) => {
  const [addOwnerInput, setAddOwnerInput] = useState<string>("");
  const [addOwnerCheckbox, setAddOwnerCheckbox] = useState<string[]>([]);
  const [pendingOwners, setPendingOwners] = useState<any>([]);

  const handleAddOwnerCheckbox = (owner: string) => {
    if (addOwnerCheckbox.includes(owner))
      setAddOwnerCheckbox(
        addOwnerCheckbox.filter((oldOwner) => oldOwner !== owner)
      );
    else setAddOwnerCheckbox([...addOwnerCheckbox, owner]);
  };

  const {
    funcs: { handleAddAOwner, handleGetPendingOwners },
  } = useWeb3();

  useEffect(() => {
    const getPendingOwners = async () => {
      setPendingOwners(await handleGetPendingOwners(contract.address));
    };
    if (isRowSelected) getPendingOwners();
  }, [isRowSelected]);

  return (
    <div
      className={`${
        isRowSelected ? "block" : "hidden"
      } bg-slate-700 text-slate-200 p-2 rounded`}
    >
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
      <div>
        <input
          className="p-2 rounded"
          type="text"
          placeholder="Add a owner"
          value={addOwnerInput}
          onChange={(e) => setAddOwnerInput(e.target.value)}
        />

        {contract.owners.map((owner) => (
          <label key={owner}>
            <input
              type="checkbox"
              checked={addOwnerCheckbox.includes(owner)}
              onChange={() => handleAddOwnerCheckbox(owner)}
            />
            {owner}
          </label>
        ))}
        <LightButton
          text="Add"
          onClick={() =>
            handleAddAOwner(contract.address, addOwnerInput, addOwnerCheckbox)
          }
        />
      </div>
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
            .map((pendingOwner: any, i: number) => (
              <PendingOwner pendingOwner={pendingOwner} contract={contract} />
            ))}
        </div>
      </div>
    </div>
  );
};
