const express = require('express');
const router = express.Router();
const donationConfirmationController = require('../controllers/donationConfirmationController');
const { protect } = require('../middlewares/authMiddleware');

// ⏺️ إرسال عرض تبرع (المتبرع فقط)
router.post('/', protect, donationConfirmationController.createDonationConfirmation);

// ✅ قبول التبرع (من صاحب الطلب)
router.patch('/:id/accept', protect, donationConfirmationController.acceptDonationConfirmation);

// ❌ رفض التبرع (من صاحب الطلب)
router.patch('/:id/reject', protect, donationConfirmationController.rejectDonationConfirmation);

// ✔️ تأكيد أن التبرع تم فعليًا
router.patch('/:id/fulfill', protect, donationConfirmationController.markAsFulfilled);

// ⭐ إرسال تقييم
router.patch('/:id/rate', protect, donationConfirmationController.rateDonation);

// 📩 جلب العروض الموجهة للمستخدم الحالي
router.get('/mine', protect, donationConfirmationController.getMyDonationOffers);

// 📥 جلب العروض حسب الطلب
router.get('/request/:requestId', protect, donationConfirmationController.getOffersByRequestId);

// 📤 العروض التي قدّمها المستخدم كمُتبرع
router.get('/sent', protect, donationConfirmationController.getMySentOffers);

// ❌ إلغاء عرض التبرع (إذا لم يُقبل بعد)
router.delete('/:id', protect, donationConfirmationController.cancelDonationConfirmation);

module.exports = router;
// This file defines the routes for donation confirmations, including creating, accepting, rejecting, fulfilling, rating, and fetching donation offers.
// It uses the `protect` middleware to ensure that only authenticated users can access these routes.