const hre = require("hardhat");

async function main() {
  const ShipmentTracker = await hre.ethers.getContractFactory("ShipmentTracker");
  const shipmentTracker = await ShipmentTracker.deploy();
  await shipmentTracker.deployed();
  console.log("ShipmentTracker deployed to:", shipmentTracker.address);

  const SupplierNFT = await hre.ethers.getContractFactory("SupplierNFT");
  const supplierNFT = await SupplierNFT.deploy();
  await supplierNFT.deployed();
  console.log("SupplierNFT deployed to:", supplierNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 