import { ethers } from "hardhat";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const contract = await ethers.deployContract("ValidityRegistry", [deployer.address]);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("ValidityRegistry deployed to:", address);
  const logLine = `${new Date().toISOString()} | ValidityRegistry=${address}\n`;
  appendFileSync(resolve(__dirname, "../deployment.log"), logLine);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
