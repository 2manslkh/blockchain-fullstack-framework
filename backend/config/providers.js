const { ethers } = require("ethers");

const getLocalProvider = () => {
  return new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
};

const getMumbaiProvider = () => {
  return new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today");
};

const getPolygonProvider = () => {
  return new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
};

module.exports = {
  getLocalProvider,
  getMumbaiProvider,
  getPolygonProvider,
};
