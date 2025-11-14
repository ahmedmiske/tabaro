// server/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");

// ✅ نستورد دالة protect فقط من كائن الـ middlewares
const { protect } = require("../middlewares/authMiddleware");

// إحصائيات خاصة بالمستخدم الحالي (محميّة بالتوكن)
router.get("/stats", protect, getDashboardStats);

// لو حاب تجرب بدون حماية مؤقتًا، علّق السطر السابق وافتح هذا:
// router.get("/stats", getDashboardStats);

module.exports = router;
