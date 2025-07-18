const express = require('express');
const router = express.Router();
const donationConfirmationController = require('../controllers/donationConfirmationController');
const { protect } = require('../middlewares/authMiddleware');

// ⏺️ إرسال عرض تبرع (المتبرع فقط)
router.post('/', protect, donationConfirmationController.createDonationConfirmation);

// ✅ قبول التبرع (من صاحب الطلب)
router.patch('/:id/accept', protect, donationConfirmationController.acceptDonationConfirmation);

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
router.delete('/:id', protect, async (req, res) => {
  try {
    const offer = await DonationConfirmation.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });

    if (String(offer.donor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'غير مصرح لك بإلغاء هذا العرض' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'لا يمكن إلغاء عرض تمت معالجته بالفعل' });
    }

    await offer.remove();
    res.status(200).json({ message: 'تم إلغاء العرض بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في إلغاء العرض:', err.message);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
});


module.exports = router;
// This code defines the routes for handling donation confirmations in a Node.js application.
// It includes routes for creating donation offers, accepting offers, marking donations as fulfilled, rating donations, and fetching donation offers related to the current user or a specific request.
// The routes are protected by authentication middleware to ensure that only authenticated users can access them.   