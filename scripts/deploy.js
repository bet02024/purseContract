// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const exec = require("child-process-promise").exec;

async function main() {

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();

  console.log("Token address => ", token.address);

  const PurseManager = await hre.ethers.getContractFactory("PurseManager");
  const purseManager = await PurseManager.deploy(token.address);
  console.log("Purse Manager address => ", purseManager.address);

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
