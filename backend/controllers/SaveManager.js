const { ethers } = require("ethers");
const { getContract } = require("../config/contracts");
const { pinata } = require("../config/pinata");
const { default: axios } = require("axios");

require("dotenv").config();

const SIGNER_KEY = process.env.SIGNER_KEY;

// Sign Save Function
const signSave = (address, ipfsHash) => {
  console.log("🚀 | signSave | address", address);
  console.log("🚀 | signSave | ipfsHash", ipfsHash);
  const signingKey = new ethers.utils.SigningKey(SIGNER_KEY);
  const nonce = ethers.utils.randomBytes(32);
  console.log(
    "IPFS_HASH_BYTES: ",
    ethers.utils.hexlify(ethers.utils.toUtf8Bytes(ipfsHash))
  );
  const msgHash = ethers.utils.solidityKeccak256(
    ["address", "string", "bytes"],
    [address, ipfsHash, nonce]
    // ethers.utils.hexConcat([address, nonce, amount, tier])
  );
  console.log("MSG_HASH: ", msgHash);
  const digest = signingKey.signDigest(msgHash);
  console.log("🚀 | signSave | digest", digest);
  const signature = ethers.utils.joinSignature(digest);
  console.log("🚀 | signSave | signature", signature);
  console.log(ethers.utils.verifyMessage(msgHash, signature));
  return { signature: signature, nonce: ethers.utils.hexlify(nonce) };
};

exports.save = async (req, res, next) => {
  let chainName = req.params.chain;
  let userAddress = req.body.user;
  let saveData = req.body.saveData;
  /// Mock:
  // saveData = {
  //   address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  //   tiles: [1, 1, 1, 0, 0, 0, 1, 1],
  //   timestamp: 10000,
  // };
  saveData.chain = chainName;

  try {
    saveData = JSON.parse(saveData);
    console.log("🚀 | exports.save= | userAddress", userAddress);
    console.log("🚀 | exports.save= | saveData", saveData);

    let result = await pinata.pinJSONToIPFS(saveData);

    const { signature, nonce } = signSave(userAddress, result.IpfsHash);

    return res.status(200).json({
      success: true,
      data: { ipfsHash: result.IpfsHash, signature, nonce },
    });
  } catch (err) {
    //handle error here
    console.log(err);
  }
};

exports.load = async (req, res, next) => {
  let address = req.query.user;
  let chainName = req.params.chain;

  // Address Input Verification
  try {
    address = ethers.utils.getAddress(address);
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: "Invalid Address",
    });
  }

  try {
    // Get Contract
    let contract = getContract("SaveManager", chainName);

    // Get IPFS Hash from blockchain
    let ipfsHash = await contract.load(address);

    if (ipfsHash) {
      // Load Data from IPFS
      let response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`);

      return res.status(200).json({
        success: true,
        data: { saveState: response },
      });
    } else {
      return res.status(401).json({
        success: false,
        data: "No Save Found",
      });
    }
  } catch (error) {
    console.log("SaveManager.load", error);
    return res.status(401).json({
      success: false,
      data: "Contract not found",
    });
  }
};
