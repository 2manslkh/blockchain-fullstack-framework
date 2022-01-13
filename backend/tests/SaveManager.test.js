const request = require("supertest");
const { ethers } = require("ethers");
const mongoose = require("mongoose");
require("dotenv").config();

// jest.mock("../../app/photo_model");
const app = require("../server");

jest.setTimeout(30000);

describe("SaveManager", () => {
  let wallet, provider, signer;

  beforeAll(() => {
    provider = new ethers.getDefaultProvider("http://127.0.0.1:8545/");
    wallet = new ethers.Wallet(process.env.TEST_WALLET_PRIVATE_KEY, provider);
  });

  afterAll(() => {
    // console.log(app.db);
    mongoose.connection.close();
    app.server.close();
  });

  test("Save Game", () => {
    return (
      request(app)
        .post("/api/v1/saveManager/localhost/save")
        .set("Content-Type", "application/json")
        .send({
          address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          tiles: [1, 1, 1, 0, 0, 0, 1, 1],
          timestamp: 10000,
        })
        // .set("Authorization", `${token.token_type} ${token.access_token}`)
        .expect(200)
        .then((response) => {
          console.log(response.body);
        })
    );
  });

  test("Load Game", () => {
    return request(app)
      .get(
        "/api/v1/saveManager/localhost/load?user=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      )
      .expect(200)
      .then((response) => {
        console.log(response);
      });
  });
});
