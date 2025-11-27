// server/routes/readyToDonateGeneralRoute.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/readyToDonateGeneralController');


// يمكنك السماح بدون تسجيل دخول إذا أردت:
// هنا أسمح بالطلب مع أو بدون توكن (auth.optional)
router.post('/', ctrl.create);
router.get('/', ctrl.list);

module.exports = router;
