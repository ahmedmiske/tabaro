// server/routes/readyToDonateBloodRoute.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readyToDonateBloodController');

// POST /api/ready-to-donate
router.post('/', ctrl.create);

// GET /api/ready-to-donate
router.get('/', ctrl.list);

module.exports = router;
