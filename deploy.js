require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const solc = require("solc");


const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_LOCAL_PRIVATE_KEY";


const BOMB_SIZE = process.env.BOMB_SIZE || 200000;

async function main() {
 
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying with address:", wallet.address);

 
  const source = fs.readFileSync("./contracts/GasDrainTrap.sol", "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "GasDrainTrap.sol": { content: source },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  console.log("Compiling contract...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    for (const err of output.errors) {
      console.error(err.formattedMessage);
    }
    throw new Error("Compilation failed");
  }

  const contractFile = output.contracts["GasDrainTrap.sol"]["GasDrainTrap"];


  const factory = new ethers.ContractFactory(
    contractFile.abi,
    contractFile.evm.bytecode.object,
    wallet
  );

  console.log(`Deploying GasDrainTrap with bomb size = ${BOMB_SIZE} bytes...`);

  const contract = await factory.deploy(BOMB_SIZE);
  await contract.waitForDeployment();

  console.log("✅ GasDrainTrap deployed to:", contract.target);
}

main().catch((err) => {
  console.error("Deployment failed:", err);
});
