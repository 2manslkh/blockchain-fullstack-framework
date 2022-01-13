require("dotenv").config();

const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

module.exports = {
  pinata,
};
