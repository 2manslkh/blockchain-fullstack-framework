import { chainMap } from "./chains";
import { ethers } from "ethers";

/**
 * Gets Deployed Contract from block chain folder
 * @param {*} contractName
 * @param {*} chainId
 * @returns Contract
 */
export const getContract = (contractName, chainId) => {
  let chain = chainMap[parseInt(chainId)];
  try {
    /* eslint-disable global-require */

    const contract = require(`../../blockchain/deployments/${chain}/${contractName}.json`);

    /* eslint-enable global-require */
    return new ethers.Contract(contract.address, contract.abi, null);
  } catch (error) {
    console.error("Contract does not exist!");
  }
};
