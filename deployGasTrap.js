import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying from:", wallet.address);

  const source = fs.readFileSync("./contracts/GasTrap.sol", "utf8");
  const solc = await import("solc");

  const input = {
    language: "Solidity",
    sources: { "GasTrap.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
  };

  // Fix for ESM import: use solc.default.compile
  const output = JSON.parse(solc.default.compile(JSON.stringify(input)));
  const contractFile = output.contracts["GasTrap.sol"]["GasTrap"];

  const factory = new ethers.ContractFactory(
    contractFile.abi,
    contractFile.evm.bytecode.object,
    wallet
  );

  const contract = await factory.deploy(3_000_000, true); // loopCeil, armed
  await contract.waitForDeployment();

  console.log("GasTrap deployed to:", contract.target);
}

main().catch(console.error);
