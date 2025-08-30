const express = require("express");
const router = express.Router();

const {
  createConfirmation,
  acceptConfirmation,     // اختياري/توافقي
  fulfillConfirmation,
  rateConfirmation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelConfirmation,
} = require("../controllers/donationRequestConfirmationController");

const { protect } = require("../middlewares/authMiddleware");
const { uploadDonationConfirm } = require("../middlewares/upload");

// رفع متعدد باسم الحقل "files"
const uploadConfirmDocs = uploadDonationConfirm.array("files", 10);

// إنشاء تأكيد
router.post("/", protect, uploadConfirmDocs, createConfirmation);

// إدارة الحالة (بدون رفض)
router.patch("/:id/accept",  protect, acceptConfirmation);   // غير مستخدم بالواجهة
router.patch("/:id/fulfill", protect, fulfillConfirmation);
router.patch("/:id/rate",    protect, rateConfirmation);

// استعلامات
router.get("/mine",              protect, getMyDonationOffers);
router.get("/sent",              protect, getMySentOffers);
router.get("/request/:requestId", protect, getOffersByRequestId);

// إلغاء قبل المعالجة
router.delete("/:id", protect, cancelConfirmation);

module.exports = router;
