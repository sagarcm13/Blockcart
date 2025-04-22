// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Escrow {
    struct Order {
        uint orderId;
        address buyer;
        address seller;
        address logisticsProvider;
        uint amount;
        bool isPaid;
        bool isDelivered;
    }

    mapping(uint => Order) public orders;
    mapping(uint => uint) public orderAmounts; // stores expected amount for each order

    event PaymentDeposited(uint orderId, address indexed buyer, uint amount);
    event OrderConfirmed(uint orderId, address indexed seller);
    event OrderCancelled(uint orderId, address indexed buyer);

    /// @notice Set expected amount before deposit
    function setOrderAmount(uint _orderId, uint _amount) public {
        // In production, you'd restrict who can call this, e.g. onlyOwner or a factory
        orderAmounts[_orderId] = _amount;
    }

    function depositPayment(
        uint _orderId,
        address _seller,
        address _logisticsProvider,
        uint _amount    // amount to be paid by user i.e. product price + logistics fee / 2
    ) public payable {
        require(msg.value > 0, "Payment required");
        require(msg.value == _amount, "Incorrect payment amount");

        orders[_orderId] = Order(
            _orderId,
            msg.sender,
            _seller,
            _logisticsProvider,
            _amount,
            true,
            false
        );

        emit PaymentDeposited(_orderId, msg.sender, _amount);
    }

    function confirmDelivery(uint _orderId, uint logisticsFee) public {     // logistics fee parameter
        Order storage order = orders[_orderId];

        require(msg.sender == order.buyer, "Only buyer can confirm delivery");
        require(order.isPaid, "Payment not deposited");
        require(!order.isDelivered, "Order already delivered");
        require(
            logisticsFee <= order.amount,
            "Logistics fee exceeds order amount"
        );
        require(
            order.logisticsProvider != address(0),
            "Invalid logistics provider"
        );

        uint sellerAmount = order.amount - logisticsFee;
        order.isDelivered = true;

        payable(order.seller).transfer(sellerAmount);
        payable(order.logisticsProvider).transfer(logisticsFee);

        emit OrderConfirmed(_orderId, order.seller);
    }

    function cancelOrder(uint _orderId) public {
        require(msg.sender == orders[_orderId].buyer, "Only buyer can cancel");
        require(!orders[_orderId].isDelivered, "Cannot cancel after delivery");

        payable(orders[_orderId].buyer).transfer(orders[_orderId].amount);
        delete orders[_orderId];

        emit OrderCancelled(_orderId, msg.sender);
    }
}
