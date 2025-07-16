const express = require('express');
const router = express.Router();
const donationConfirmationController = require('../controllers/donationConfirmationController');
const { protect } = require('../middlewares/authMiddleware');

// ⏺️ إرسال عرض تبرع (المتبرع فقط)
router.post('/', protect, donationConfirmationController.createDonationConfirmation);

// ✅ قبول التبرع (من صاحب الطلب)
router.patch('/:id/accept', protect, donationConfirmationController.acceptDonation);

// ✔️ تأكيد أن التبرع تم فعليًا
router.patch('/:id/fulfill', protect, donationConfirmationController.markAsFulfilled);

// ⭐ إرسال تقييم
router.patch('/:id/rate', protect, donationConfirmationController.rateDonation);

// 📩 جلب العروض الموجهة للمستخدم الحالي
router.get('/mine', protect, donationConfirmationController.getMyDonationOffers);

router.get('/request/:requestId', protect, donationConfirmationController.getOffersByRequestId);

module.exports = router;
// This code defines the routes for handling donation confirmations in a Node.js application.
// It includes routes for creating a donation confirmation, accepting a donation, marking a donation as fulfilled