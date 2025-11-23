const express = require("express");
const router = express.Router();
const { getAllCommunes } = require("../controllers/communeController");

router.get("/", getAllCommunes);

module.exports = router;
