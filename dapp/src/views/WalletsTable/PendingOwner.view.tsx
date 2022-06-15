import { FC } from "react";
import { useWeb3 } from "../../hooks";

type PendingOwnerType = {
  pendingOwner: {
    approvedBy: string[];
    neededOwners: string[];
    ownerAddress: string;
    from: string;
    at: Date;
  };
  contract: {
    address: string;
    owners: string[];
    balances: { address: string; name: string; balance: number }[];
  };
};

export const PendingOwner: FC<PendingOwnerType> = ({
  pendingOwner,
  contract,
}) => {
  const {
    funcs: {
      formatAddress,
      handleApproveOwner,
      handleExecOwner,
    },
    account,
  } = useWeb3();

  return (
    <div className="border rounded p-2 bg-slate-800 flex flex-col w-1/2 mb-1">
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
            onClick={async () =>
              handleApproveOwner(contract.address, pendingOwner.ownerAddress)
            }
          >
            Approve
          </span>
        )}
      {pendingOwner.approvedBy.length === pendingOwner.neededOwners.length && (
        <span
          className="border border-violet-600 bg-violet-600 rounded p-2 text-center"
          onClick={() =>
            handleExecOwner(contract.address, pendingOwner.ownerAddress)
          }
        >
          Confirm
        </span>
      )}
    </div>
  );
};
