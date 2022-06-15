import { FC, useState } from "react";
import { LightButton, MainButton } from "../../../components";
import { IMultisig, IPendingOwner, useWeb3 } from "../../../hooks";

type AddOwnerFormType = {
  contract: IMultisig;
  setPendingOwners: (pendingOwners: IPendingOwner[]) => void;
};

export const AddOwnerForm: FC<AddOwnerFormType> = ({
  contract,
  setPendingOwners,
}) => {
  const [addOwnerInput, setAddOwnerInput] = useState<string>("");
  const [addOwnerCheckbox, setAddOwnerCheckbox] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toogleIsOpen = () => setIsOpen(!isOpen);

  const {
    funcs: { handleAddAOwner },
  } = useWeb3();

  const handleAddOwnerCheckbox = (owner: string) => {
    if (addOwnerCheckbox.includes(owner))
      setAddOwnerCheckbox(
        addOwnerCheckbox.filter((oldOwner) => oldOwner !== owner)
      );
    else setAddOwnerCheckbox([...addOwnerCheckbox, owner]);
  };

  const submit = async () => {
    setPendingOwners(
      await handleAddAOwner(contract.address, addOwnerInput, addOwnerCheckbox)
    );
  };

  return (
    <>
      {isOpen ? (
        <div className="mt-3 border p-4">
          <p className="text-2xl text-center">Add a owner</p>
          <div className="mt-4">
            <input
              className="p-2 rounded text-slate-800 w-full"
              type="text"
              placeholder="New owner address"
              value={addOwnerInput}
              onChange={(e) => setAddOwnerInput(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <p className="underline italic text-xl">
              Select owners allow to approve the new owner :
            </p>
            {contract.owners.map((owner) => (
              <label key={owner} className="block mt-2">
                <input
                  type="checkbox"
                  checked={addOwnerCheckbox.includes(owner)}
                  onChange={() => handleAddOwnerCheckbox(owner)}
                />
                {owner}
              </label>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="w-1/2 pr-1">
              <MainButton text="Add a pending owner" onClick={submit} />
            </div>
            <div className="w-1/2 pl-1">
              <LightButton text="Cancel" onClick={async () => toogleIsOpen()} />
            </div>{" "}
          </div>
        </div>
      ) : (
        <div>
          <span
            onClick={toogleIsOpen}
            className="italic underline text-violet-400"
          >
            Add a owner
          </span>
        </div>
      )}
    </>
  );
};
