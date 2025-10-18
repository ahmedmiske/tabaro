const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/readyToDonateGeneralController');

router.post('/', /*authOptional,*/ ctrl.create);
router.get('/', /*authOptional,*/ ctrl.list);

module.exports = router;
