const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createConfirmation, listByRequest } = require('../controllers/donationRequestConfirmationController');

router.post('/', protect, createConfirmation);
router.get('/by-request/:id', protect, listByRequest);

module.exports = router;
