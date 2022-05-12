import "dotenv/config";

import { GasLogger } from "../utils/helper";
import { ethers } from "hardhat";

const gasLogger = new GasLogger();

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  console.log("ChainID: ", chainId);

  // Config
  console.log(`Deploying Greeter... from ${deployer}`);

  let coursePass = await deploy("Greeter", {
    from: deployer,
    args: ["Hello World!"],
  });
};

module.exports.tags = ["Greeter"];
