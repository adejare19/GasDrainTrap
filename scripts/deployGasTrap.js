import { ethers } from "hardhat";

async function main() {
  const GasTrap = await ethers.getContractFactory("GasTrap");
  const trap = await GasTrap.deploy(3_000_000, true); // loopCeil, armed
  await trap.deployed();

  console.log("GasTrap deployed to:", trap.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
