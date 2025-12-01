// server/routes/adminRoute.js
const express = require("express");
const router = express.Router();

const {
  getAdminUsers,
  updateUserStatus,
  deleteUser,

  getAdminBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,

  getAdminGeneralRequests,
  updateGeneralRequestStatus,
  deleteGeneralRequest,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// كل مسارات /api/admin محمية للمشرف فقط
router.use(protect, authorize("admin"));

/* ========= المستخدمون ========= */

// قائمة المستخدمين
router.get("/users", getAdminUsers);

// تغيير حالة المستخدم (تفعيل / تعليق)
router.patch("/users/:id/status", updateUserStatus);

// حذف مستخدم نهائياً
router.delete("/users/:id", deleteUser);

/* ========= طلبات التبرع بالدم ========= */

// قائمة طلبات الدم
router.get("/blood-requests", getAdminBloodRequests);

// تغيير حالة طلب دم (تفعيل / تعطيل) + سبب اختياري
// المسار الرسمي
router.patch("/blood-requests/:id/status", updateBloodRequestStatus);
// alias حتى يطابق ما يستعمله الفرونت (/toggle-active)
router.patch("/blood-requests/:id/toggle-active", updateBloodRequestStatus);

// حذف طلب دم
router.delete("/blood-requests/:id", deleteBloodRequest);

/* ========= طلبات التبرع العام ========= */

// قائمة طلبات التبرع العام
router.get("/general-requests", getAdminGeneralRequests);

// تغيير حالة طلب عام (active / paused / completed / cancelled) + سبب اختياري
// المسار الرسمي
router.patch("/general-requests/:id/status", updateGeneralRequestStatus);
// alias حتى يطابق ما يستعمله الفرونت (/toggle-status)
router.patch(
  "/general-requests/:id/toggle-status",
  updateGeneralRequestStatus
);

// حذف طلب عام
router.delete("/general-requests/:id", deleteGeneralRequest);

module.exports = router;
