import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying InvoiceRegistry to Moonbase Alpha...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying from address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "DEV\n");

  // Deploy InvoiceRegistry
  const InvoiceRegistry = await ethers.getContractFactory("InvoiceRegistry");
  console.log("📝 Deploying InvoiceRegistry...");

  const invoiceRegistry = await InvoiceRegistry.deploy(deployer.address);
  await invoiceRegistry.waitForDeployment();

  const address = await invoiceRegistry.getAddress();
  console.log("✅ InvoiceRegistry deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    network: "moonbase",
    chainId: 1287,
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contractName: "InvoiceRegistry",
  };

  const deploymentPath = path.join(__dirname, "../deployment.log");
  const logEntry = `\n${new Date().toISOString()} - InvoiceRegistry deployed at ${address} by ${deployer.address}`;
  fs.appendFileSync(deploymentPath, logEntry);

  console.log("\n📋 Deployment Summary:");
  console.log("   Contract:", deploymentInfo.contractName);
  console.log("   Address:", deploymentInfo.contractAddress);
  console.log("   Network:", deploymentInfo.network);
  console.log("   Chain ID:", deploymentInfo.chainId);
  console.log("   Deployer:", deploymentInfo.deployer);

  console.log("\n📝 Next steps:");
  console.log("   1. Add this to your .env.local:");
  console.log(`      NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS=${address}`);
  console.log("\n   2. Verify the contract on Moonscan:");
  console.log(
    `      npx hardhat verify --network moonbase ${address} "${deployer.address}"`
  );
  console.log("\n   3. View on Moonbase Explorer:");
  console.log(`      https://moonbase.moonscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
