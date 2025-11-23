const express = require("express");
const router = express.Router();
const { getAllMoughataas } = require("../controllers/moughataaController");

router.get("/", getAllMoughataas);

module.exports = router;
