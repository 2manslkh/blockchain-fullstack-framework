const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

require("dotenv").config();

const connectDB = require("./config/db");

// ----------------------------------
// Routes Import
// ----------------------------------
const saveManager = require("./routes/SaveManager");

// ----------------------------------
// Middleware
// ----------------------------------
const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// ----------------------------------
// API Routes
// ----------------------------------

app.use("/api/v1/saveManager", saveManager);

// ----------------------------------
// Express server
// ----------------------------------
const PORT = process.env.PORT || 5000;
app.db = connectDB();

app.server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
