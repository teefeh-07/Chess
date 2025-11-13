const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying QuantumChessArena to Somnia Testnet...");

  const QuantumChessArena = await ethers.getContractFactory("QuantumChessArena");
  const quantumChessArena = await QuantumChessArena.deploy();

  await quantumChessArena.deployed();

  const contractAddress = quantumChessArena.address;
  console.log("QuantumChessArena deployed to:", contractAddress);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress,
    network: "somniaTestnet",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
