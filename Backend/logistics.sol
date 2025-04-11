// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Logistics {
    struct Delivery {
        uint orderId;
        string status; // "Pending", "Shipped", "Delivered"
        string emailId; // Logistics provider's emailId
    }

    struct Provider {
        string emailId;
        uint distancePrice; // Price per unit distance
        address walletAddress; // Wallet address of provider
    }

    mapping(uint => Delivery) public deliveries;
    mapping(string => Provider) private providers; // emailId => Provider

    uint public deliveryCount;

    event LogisticsAssigned(uint orderId, string emailId);
    event StatusUpdated(uint orderId, string newStatus, string emailId);
    event ProviderRegistered(string emailId, uint distancePrice, address walletAddress);

    // Register a logistics provider
    function registerProvider(
        string memory _emailId,
        uint _distancePrice,
        address _walletAddress
    ) public {
        require(bytes(providers[_emailId].emailId).length == 0, "Provider already registered");
        providers[_emailId] = Provider(_emailId, _distancePrice, _walletAddress);
        emit ProviderRegistered(_emailId, _distancePrice, _walletAddress);
    }

    // Assign a delivery to a provider
    function assignLogistics(uint _orderId, string memory _emailId) public {
        require(bytes(providers[_emailId].emailId).length > 0, "Provider not registered");
        deliveries[_orderId] = Delivery(_orderId, "Pending", _emailId);
        deliveryCount++;
        emit LogisticsAssigned(_orderId, _emailId);
    }

    // Update delivery status
    function updateDeliveryStatus(
        uint _orderId,
        string memory _status,
        string memory _emailId
    ) public {
        require(
            keccak256(abi.encodePacked(deliveries[_orderId].emailId)) ==
                keccak256(abi.encodePacked(_emailId)),
            "Only assigned logistics provider can update with correct emailId"
        );
        deliveries[_orderId].status = _status;
        emit StatusUpdated(_orderId, _status, _emailId);
    }

    // Get provider's wallet address by email
    function getProviderAddress(string memory _emailId) public view returns (address) {
        require(bytes(providers[_emailId].emailId).length > 0, "Provider not found");
        return providers[_emailId].walletAddress;
    }
}
