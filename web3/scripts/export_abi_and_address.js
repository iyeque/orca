const fs = require('fs');
const path = require('path');

async function exportArtifacts() {
  const ShipmentTracker = artifacts.require('ShipmentTracker');
  const SupplierNFT = artifacts.require('SupplierNFT');

  const shipmentAbi = ShipmentTracker.abi;
  const nftAbi = SupplierNFT.abi;

  const shipmentAddress = ShipmentTracker.address;
  const nftAddress = SupplierNFT.address;

  fs.writeFileSync(path.join(__dirname, '../../smart_contracts/ShipmentTracker.abi.json'), JSON.stringify(shipmentAbi, null, 2));
  fs.writeFileSync(path.join(__dirname, '../../smart_contracts/SupplierNFT.abi.json'), JSON.stringify(nftAbi, null, 2));
  fs.writeFileSync(path.join(__dirname, '../../smart_contracts/contract_addresses.json'), JSON.stringify({
    SHIPMENT_TRACKER_ADDRESS: shipmentAddress,
    SUPPLIER_NFT_ADDRESS: nftAddress
  }, null, 2));
}

exportArtifacts(); 