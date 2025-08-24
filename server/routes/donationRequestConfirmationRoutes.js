const express = require("express");
const router = express.Router();

const {
  createConfirmation,
  listByRequest,
} = require("../controllers/donationRequestConfirmationController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadDonationConfirm } = require("../middlewares/upload");

// يدعم رفع متعدد بنفس اسم الحقل "files"
const uploadConfirmDocs = uploadDonationConfirm.array("files", 10);

router.post("/", protect, uploadConfirmDocs, createConfirmation);
router.get("/request/:id", protect, listByRequest);

module.exports = router;
