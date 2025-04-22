// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Logistics {
    struct Delivery {
        uint orderId;
        string status; // "Pending", "Accepted", "Shipped", "Delivered"
        string emailId; // Logistics provider's emailId
    }

    struct Provider {
        string emailId;
        uint distancePrice; // Price per unit distance
        address walletAddress; // Wallet address of provider
    }

    mapping(uint => Delivery) public deliveries;
    mapping(string => Provider) private providers; // emailId => Provider
    string[] private providerEmails; // Track provider email IDs for iteration

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
        providerEmails.push(_emailId); // Track for iteration
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

    // Get full provider details by email
    function getLogisticsProvider(string memory _emailId) public view returns (
        string memory,
        uint,
        address
    ) {
        require(bytes(providers[_emailId].emailId).length > 0, "Provider not found");
        Provider memory p = providers[_emailId];
        return (p.emailId, p.distancePrice, p.walletAddress);
    }

    //  New function: Get providers with distancePrice less than given value
    function getProvidersByMaxDistancePrice(uint _maxDistancePrice) public view returns (
        Provider[] memory
    ) {
        uint count = 0;

        // First pass: count how many match
        for (uint i = 0; i < providerEmails.length; i++) {
            if (providers[providerEmails[i]].distancePrice < _maxDistancePrice) {
                count++;
            }
        }

        // Second pass: collect matching providers
        Provider[] memory result = new Provider[](count);
        uint index = 0;

        for (uint i = 0; i < providerEmails.length; i++) {
            Provider memory p = providers[providerEmails[i]];
            if (p.distancePrice < _maxDistancePrice) {
                result[index] = p;
                index++;
            }
        }

        return result;
    }
}
