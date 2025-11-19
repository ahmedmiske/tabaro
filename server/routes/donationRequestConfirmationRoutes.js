const express = require("express");
const router = express.Router();

const {
  createConfirmation,
  acceptConfirmation,
  fulfillConfirmation,
  rateConfirmation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelConfirmation,
  getDonationRequestConfirmationById, // ✅
} = require("../controllers/donationRequestConfirmationController");

const { protect } = require("../middlewares/authMiddleware");
const { uploadDonationConfirm } = require("../middlewares/upload");

// رفع متعدد باسم الحقل "files"
const uploadConfirmDocs = uploadDonationConfirm.array("files", 10);

// إنشاء تأكيد تبرع عام
router.post("/", protect, uploadConfirmDocs, createConfirmation);

// إدارة الحالة
router.patch("/:id/accept", protect, acceptConfirmation);
router.patch("/:id/fulfill", protect, fulfillConfirmation);
router.patch("/:id/rate", protect, rateConfirmation);

// استعلامات
router.get("/mine", protect, getMyDonationOffers);
router.get("/sent", protect, getMySentOffers);
router.get("/request/:requestId", protect, getOffersByRequestId);

// ✅ جلب تأكيد طلب واحد بالمعرف (بعد المسارات السابقة)
router.get("/:id", protect, getDonationRequestConfirmationById);

// إلغاء قبل المعالجة
router.delete("/:id", protect, cancelConfirmation);

module.exports = router;
