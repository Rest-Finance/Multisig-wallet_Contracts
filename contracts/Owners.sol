//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Owners {
    address[] public _owners;
    mapping(address => uint256) _ownersIds;

    struct PendingOwner {
        uint256 at;
        address from;
        address ownerAddress;
        address[] approvedBy;
        address[] neededOwners;
    }
    PendingOwner[] private pendingOwners;
    mapping(address => uint256) pendingOwnersIds;
    event NewPendingOwner(PendingOwner pendingOwner);
    enum AllowOwnerSteps {
        INIT,
        CONFIRMED,
        EXEC
    }
    event AllowOwnerStep(
        address from,
        AllowOwnerSteps step,
        uint256 date,
        address newOwner,
        address[] confirmedBy,
        address[] neededOwners
    );

    modifier onlyOwner() {
        require(_owners[_ownersIds[msg.sender]] == msg.sender, "Not Allowed");
        _;
    }

    function seedAfterCloned(address ownerAddress) public {
        require(_owners.length == 0, "Contract already initialized");
        _ownersIds[ownerAddress] = _owners.length;
        _owners.push(ownerAddress);
    }

    function getOwners() public view onlyOwner returns (address[] memory) {
        return _owners;
    }

    function initNewOwner(address ownerAddress, address[] memory neededOwners)
        public
        onlyOwner
    {
        for (uint256 i = 0; i < _owners.length; i++) {
            require(ownerAddress != _owners[i], "Address already an owner");
        }

        for (uint256 i = 0; i < neededOwners.length; i++) {
            bool isNeededOwneraOwner = false;
            for (uint256 j = 0; j < _owners.length; j++) {
                if (_owners[j] == neededOwners[i]) {
                    isNeededOwneraOwner = true;
                }
            }
            require(isNeededOwneraOwner, "Need a list of owner");
        }

        address[] memory confirmedBy;
        pendingOwnersIds[ownerAddress] = pendingOwners.length;
        PendingOwner memory pendingOwner = PendingOwner(
            block.timestamp,
            msg.sender,
            ownerAddress,
            confirmedBy,
            neededOwners
        );
        pendingOwners.push(pendingOwner);
        emit AllowOwnerStep(
            msg.sender,
            AllowOwnerSteps.INIT,
            block.timestamp,
            ownerAddress,
            confirmedBy,
            neededOwners
        );
    }

    function confirmNewOwner(address ownerAddress) public onlyOwner {
        PendingOwner memory pendingOwner = pendingOwners[
            pendingOwnersIds[ownerAddress]
        ];

        bool userInRequestedOwner = false;
        for (uint256 i = 0; i < pendingOwner.neededOwners.length; i++) {
            for (uint256 j = 0; j < pendingOwner.approvedBy.length; j++) {
                require(
                    pendingOwner.neededOwners[i] != pendingOwner.approvedBy[j],
                    "Already allowed owner"
                );
            }
            if (pendingOwner.neededOwners[i] == msg.sender) {
                userInRequestedOwner = true;
            }
        }
        require(userInRequestedOwner, "Cannot allowed this owner");

        pendingOwners[pendingOwnersIds[ownerAddress]].approvedBy.push(
            msg.sender
        );
        emit AllowOwnerStep(
            msg.sender,
            AllowOwnerSteps.CONFIRMED,
            block.timestamp,
            ownerAddress,
            pendingOwners[pendingOwnersIds[ownerAddress]].approvedBy,
            pendingOwner.neededOwners
        );
    }

    function execNewOwner(address ownerAddress) public onlyOwner {
        PendingOwner memory pendingOwner = pendingOwners[
            pendingOwnersIds[ownerAddress]
        ];
        require(
            pendingOwner.approvedBy.length == pendingOwner.neededOwners.length,
            "Confirmation step not over"
        );
        _ownersIds[ownerAddress] = _owners.length;
        _owners.push(ownerAddress);
        emit AllowOwnerStep(
            msg.sender,
            AllowOwnerSteps.EXEC,
            block.timestamp,
            ownerAddress,
            pendingOwners[pendingOwnersIds[ownerAddress]].approvedBy,
            pendingOwners[pendingOwnersIds[ownerAddress]].neededOwners
        );
        delete pendingOwners[pendingOwnersIds[ownerAddress]];
        delete pendingOwnersIds[ownerAddress];
    }
}
