// server/routes/userRoute.js
const express = require("express");
const multer = require("multer");
const path = require("path"); // ← أضف هذا

const {
  registerUser,
  authUser,
  getUsers,
  updateUser,
  getUser,
  changePassword,
  deleteUser,
  resetPassword,
} = require("../controllers/userController");

const { protect, authorize, protectRegisterUser } = require("../middlewares/authMiddleware");

// ✅ تخزين الصور داخل server/uploads/profileImages دائماً
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/profileImages")); // ← أهم تعديل
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

// ✅ تسجيل مستخدم جديد مع رفع صورة
router
  .route("/")
  .post(upload.single("profileImage"), registerUser)
  .get(protect, authorize("admin"), getUsers);

router.post("/login", authUser);

router
  .route("/profile")
  .put(protect, updateUser)
  .get(protect, getUser)
  .delete(protect, deleteUser);

router.put("/change-password", protect, changePassword);
router.put("/reset-password", protectRegisterUser, resetPassword);

router.get("/notifications", protect, require("../controllers/notificationController").getUserNotifications);
router.put("/notifications/:id", protect, require("../controllers/notificationController").markNotificationAsRead);
router.get("/notifications/unread-count", protect, require("../controllers/notificationController").getUnreadNotificationCount);

module.exports.userRoutes = router;
