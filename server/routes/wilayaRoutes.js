const express = require("express");
const router = express.Router();
const { getAllWilayas } = require("../controllers/wilayaController");

router.get("/", getAllWilayas);

module.exports = router;
