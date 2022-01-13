const express = require("express");
const router = express.Router();

const { load, save } = require("../controllers/SaveManager");

router.route("/:chain/load").get(load);
router.route("/:chain/save").post(save);

module.exports = router;
