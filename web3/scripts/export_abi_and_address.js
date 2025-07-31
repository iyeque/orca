const fs = require('fs');
const path = require('path');
const hre = require("hardhat");

async function exportArtifacts() {
  const shipmentTrackerArtifact = await hre.artifacts.readArtifact("ShipmentTracker");
  const supplierNFTArtifact = await hre.artifacts.readArtifact("SupplierNFT");

  const addressesPath = path.join(__dirname, 'contract_addresses.json');
  const deployedAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  const shipmentAbi = shipmentTrackerArtifact.abi;
  const nftAbi = supplierNFTArtifact.abi;

  const shipmentAddress = deployedAddresses.ShipmentTracker;
  const nftAddress = deployedAddresses.SupplierNFT;

  // Ensure the target directory exists
  const targetDir = path.join(__dirname, '../../backend/contracts');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(path.join(targetDir, 'ShipmentTracker.abi.json'), JSON.stringify(shipmentAbi, null, 2));
  fs.writeFileSync(path.join(targetDir, 'SupplierNFT.abi.json'), JSON.stringify(nftAbi, null, 2));
  fs.writeFileSync(path.join(targetDir, 'contract_addresses.json'), JSON.stringify({
    SHIPMENT_TRACKER_ADDRESS: shipmentAddress,
    SUPPLIER_NFT_ADDRESS: nftAddress
  }, null, 2));

  console.log("Contract ABIs and addresses exported successfully.");
}

exportArtifacts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
