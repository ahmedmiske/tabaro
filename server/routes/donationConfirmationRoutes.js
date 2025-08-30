const express = require("express");
const router = express.Router();

const {
  createDonationConfirmation,
  acceptDonationConfirmation,   // توافقي فقط
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

// قبول (توافقي – الواجهة لا تستخدمه)
router.patch("/:id/accept", protect, acceptDonationConfirmation);

// تأكيد الاستلام → fulfilled
router.patch("/:id/fulfill", protect, markAsFulfilled);

// تقييم
router.patch("/:id/rate", protect, rateDonation);

// استعلامات
router.get("/mine", protect, getMyDonationOffers);    // ما وصلني من عروض
router.get("/sent", protect, getMySentOffers);        // ما أرسلته أنا
router.get("/request/:requestId", protect, getOffersByRequestId);

// إلغاء العرض (للمتبرع قبل الاستلام)
router.delete("/:id", protect, cancelDonationConfirmation);

module.exports = router;
