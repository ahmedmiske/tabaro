// server/routes/donationConfirmationRoutes.js
const express = require("express");
const router = express.Router();

const {
  createDonationConfirmation,
  acceptDonationConfirmation,
  rejectDonationConfirmation,
  markAsFulfilled,
  rateDonation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelDonationConfirmation,
} = require("../controllers/donationConfirmationController");

const { protect } = require("../middlewares/authMiddleware");

// إنشاء عرض تبرع (دم)
router.post("/", protect, createDonationConfirmation);

// قبول/رفض/تنفيذ/تقييم (ما زالت خاصة «الدم»)
router.patch("/:id/accept", protect, acceptDonationConfirmation);
router.patch("/:id/reject", protect, rejectDonationConfirmation);
router.patch("/:id/fulfill", protect, markAsFulfilled);
router.patch("/:id/rate", protect, rateDonation);

// استعلامات
router.get("/mine", protect, getMyDonationOffers);
router.get("/request/:requestId", protect, getOffersByRequestId);
router.get("/sent", protect, getMySentOffers);

// إلغاء
router.delete("/:id", protect, cancelDonationConfirmation);

module.exports = router;
