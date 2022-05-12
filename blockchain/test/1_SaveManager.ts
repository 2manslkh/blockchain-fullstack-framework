import "dotenv/config";

import { deployments, ethers, network } from "hardhat";

import { BigNumber } from "ethers";
import { CardsAgainstNFTS } from "./../typechain/CardsAgainstNFTS";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

describe("SaveManager", function () {
  let owner;
  let saveManager;

  before(async function () {
    // Get Signers
    [owner] = await ethers.getSigners();

    // Setup Test
    await deployments.fixture(["SaveManager"]);
    saveManager = await ethers.getContract("SaveManager", owner);
  });

  it("Save & Load Game", async function () {
    // Call API to get Signing Key

    let response = await axios.post(
      "http://localhost:5000/api/v1/saveManager/localhost/save",
      {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        tiles: [1, 1, 1, 0, 0, 0, 1, 1],
        timestamp: 10000,
      }
    );

    let ipfsHash = response.data.data.ipfsHash;
    let signature = response.data.data.signature;
    let nonce = response.data.data.nonce;

    console.log("IPFS HASH: ", ipfsHash);
    console.log("SIGNATURE: ", signature);
    console.log("NONCE: ", nonce);

    // Call Blockchain
    await (await saveManager.save(ipfsHash, signature, nonce)).wait();

    // Expect Load to return IPFS Hash
    console.log(await saveManager.load(owner.address));
    expect(await saveManager.load(owner.address)).to.equal(ipfsHash);
  });
});
