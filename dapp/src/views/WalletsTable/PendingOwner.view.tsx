import { FC } from "react";
import { IMultisig, IPendingOwner, useWeb3 } from "../../hooks";

type PendingOwnerType = {
  pendingOwner: IPendingOwner;
  contract: IMultisig;
  setPendingOwners: (
    pendingOwners: IPendingOwner[]
  ) => void;
};

export const PendingOwner: FC<PendingOwnerType> = ({
  pendingOwner,
  contract,
  setPendingOwners,
}) => {
  const {
    funcs: { formatAddress, handleApproveOwner, handleExecOwner },
    account,
  } = useWeb3();

  const confirm = async () => {
    setPendingOwners(
      await handleExecOwner(contract.address, pendingOwner.ownerAddress)
    );
  };

  const approve = async () => {
    setPendingOwners(
      await handleApproveOwner(contract.address, pendingOwner.ownerAddress)
    );
  };
  return (
    <div
      key={pendingOwner.ownerAddress}
      className="border rounded p-2 bg-slate-800 flex flex-col w-1/2 mb-1"
    >
      <p>
        <span className="font-bold">Pending owner address: </span>
        {formatAddress(pendingOwner.ownerAddress)}
      </p>
      <p>
        <span className="font-bold">Request by: </span>{" "}
        {formatAddress(pendingOwner.from)}
      </p>
      <p>
        <span className="font-bold">At: </span> {pendingOwner.at.toString()}
      </p>
      {pendingOwner.neededOwners
        .map((a: string) => a.toLowerCase())
        .includes(account as string) &&
        !pendingOwner.approvedBy
          .map((a: string) => a.toLowerCase())
          .includes(account as string) && (
          <span
            className="border border-violet-600 bg-violet-600 rounded p-2 text-center"
            onClick={approve}
          >
            Approve
          </span>
        )}
      {pendingOwner.approvedBy.length === pendingOwner.neededOwners.length && (
        <span
          className="border border-violet-600 bg-violet-600 rounded p-2 text-center"
          onClick={confirm}
        >
          Confirm
        </span>
      )}
    </div>
  );
};
