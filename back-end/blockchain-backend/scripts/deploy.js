// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Deploying FileSharing contract...");
  
  const FileSharing = await hre.ethers.deployContract("FileSharing");
  
  await FileSharing.waitForDeployment();
  
  const contractAddress = await FileSharing.getAddress();
  
  console.log("FileSharing contract deployed to:", contractAddress);
  console.log("\nIMPORTANT: Update this contract address in:");
  console.log("1. blockshare-frontend/src/services/BlockchainService.jsx (CONTRACT_ADDRESS)");
  console.log("2. back-end/python-backend/blochain_service.py (contract_address)");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
