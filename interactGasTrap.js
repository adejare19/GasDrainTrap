import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const source = fs.readFileSync("./contracts/GasTrap.sol", "utf8");
  const solc = await import("solc");
  const input = {
    language: "Solidity",
    sources: { "GasTrap.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi"] } } },
  };
  const output = JSON.parse(solc.default.compile(JSON.stringify(input)));
  const contractFile = output.contracts["GasTrap.sol"]["GasTrap"];

  const trap = new ethers.Contract(CONTRACT_ADDRESS, contractFile.abi, wallet);

  

  // 1. Check if an address is whitelisted
  const someAddress = "0xa5a7468bda6ffE54e7A9bf8e88CA196A506c7124";
  const isWhitelisted = await trap.whitelist(someAddress);
  console.log(`Is whitelisted: ${isWhitelisted}`);

  // 2. Add an address to whitelist (owner only)
  const tx1 = await trap.setWhitelist(someAddress, true);
  await tx1.wait();
  console.log(`${someAddress} added to whitelist`);

  // 3. Call enter() to trigger the trap
  try {
    await trap.enter("0x");
  } catch (err) {
    console.log("Trap triggered:", err.reason || err.message);
  }

  // 4. Toggle armed (owner only)
  const tx2 = await trap.setArmed(false);
  await tx2.wait();
  console.log("Trap disarmed");
}

main().catch(console.error);
