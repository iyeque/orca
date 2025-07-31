const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const ShipmentTracker = await hre.ethers.getContractFactory("ShipmentTracker");
  const shipmentTracker = await ShipmentTracker.deploy();
  await shipmentTracker.deployed();
  console.log("ShipmentTracker deployed to:", shipmentTracker.address);

  const SupplierNFT = await hre.ethers.getContractFactory("SupplierNFT");
  const supplierNFT = await SupplierNFT.deploy();
  await supplierNFT.deployed();
  console.log("SupplierNFT deployed to:", supplierNFT.address);

  const addresses = {
    ShipmentTracker: shipmentTracker.address,
    SupplierNFT: supplierNFT.address,
  };

  const addressesPath = path.join(__dirname, 'contract_addresses.json');
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("Deployed contract addresses saved to:", addressesPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});