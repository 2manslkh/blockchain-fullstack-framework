const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  console.log("ChainID: ", chainId);

  // Config
  console.log(`Deploying SaveManager... from ${deployer}`);

  let saveManager = await deploy("SaveManager", {
    from: deployer,
    args: [process.env.SIGNER_ADDRESS],
  });
};

module.exports.tags = ["SaveManager"];
