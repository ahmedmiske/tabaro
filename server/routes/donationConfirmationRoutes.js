const express = require("express");
const router = express.Router();

const {
  createDonationConfirmation,
  acceptDonationConfirmation,
  markAsFulfilled,
  rateDonation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelDonationConfirmation,
  getDonationConfirmationById,   // ✅ جديد
} = require("../controllers/donationConfirmationController");

const { protect } = require("../middlewares/authMiddleware");

// إنشاء عرض تبرع (دم)
router.post("/", protect, createDonationConfirmation);

// إدارة الحالة
router.patch("/:id/accept",  protect, acceptDonationConfirmation);
router.patch("/:id/fulfill", protect, markAsFulfilled);
router.patch("/:id/rate",    protect, rateDonation);

// استعلامات
router.get("/mine",              protect, getMyDonationOffers);
router.get("/sent",              protect, getMySentOffers);
router.get("/request/:requestId", protect, getOffersByRequestId);

// ✅ جلب تأكيد واحد بالمعرف (ضعه بعد المسارات السابقة حتى لا يصطاد /mine أو /sent)
router.get("/:id", protect, getDonationConfirmationById);

// إلغاء العرض (للمتبرع قبل الاستلام)
router.delete("/:id", protect, cancelDonationConfirmation);

module.exports = router;
