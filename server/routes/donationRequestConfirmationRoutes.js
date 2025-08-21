// server/routes/donationRequestConfirmationRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { createConfirmation, listByRequest } = require('../controllers/donationRequestConfirmationController');
const { uploadDonationConfirm } = require('../middlewares/upload');

// يدعم رفع متعدد بنفس اسم الحقل "files"
const uploadConfirmDocs = uploadDonationConfirm.array('files', 10);

router.post('/', protect, uploadConfirmDocs, createConfirmation);
router.get('/by-request/:id', protect, listByRequest);

module.exports = router;
