const {
  getLocalProvider,
  getMumbaiProvider,
  getPolygonProvider,
} = require("./providers");

const { ethers } = require("ethers");

/**
 * Gets Deployed Contract from block chain folder
 * @param {string} contractName
 * @param {string} chainName
 * @returns Contract
 */
const getContract = (contractName, chainName) => {
  try {
    let provider;
    if (chainName === "localhost") {
      provider = getLocalProvider();
    } else if (chainName === "mumbai") {
      provider = getMumbaiProvider();
    } else if (chainName === "matic" || chainName === "polygon") {
      provider = getPolygonProvider();
    }

    /* eslint-disable global-require */
    const contract = require(`../../blockchain/deployments/${chainName}/${contractName}.json`);
    /* eslint-enable global-require */
    return new ethers.Contract(contract.address, contract.abi, provider);
  } catch (error) {
    console.error("Contract does not exist!");
  }
};

module.exports = {
  getContract,
};
