// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipmentTracker {
    struct Shipment {
        uint id;
        string description;
        address owner;
        bool delivered;
    }
    mapping(uint => Shipment) public shipments;
    uint public shipmentCount;

    event ShipmentCreated(uint id, string description, address owner);
    event ShipmentDelivered(uint id);

    function createShipment(string memory description) public {
        shipmentCount++;
        shipments[shipmentCount] = Shipment(shipmentCount, description, msg.sender, false);
        emit ShipmentCreated(shipmentCount, description, msg.sender);
    }

    function markDelivered(uint id) public {
        require(shipments[id].owner == msg.sender, "Not owner");
        shipments[id].delivered = true;
        emit ShipmentDelivered(id);
    }
} 