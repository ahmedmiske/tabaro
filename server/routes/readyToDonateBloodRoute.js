// server/routes/readyToDonateBloodRoute.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readyToDonateBloodController');

// GET /api/ready-to-donate
router.get('/', ctrl.list);
router.post('/', ctrl.create);

module.exports = router;
