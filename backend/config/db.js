require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");

const connectDB = () => {
  mongoose
    .connect("mongodb://localhost:27017/blockchain")
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => {
      console.error("FAILED to connect to MongoDB: " + err);
      process.exit(1);
    });
};

module.exports = connectDB;
