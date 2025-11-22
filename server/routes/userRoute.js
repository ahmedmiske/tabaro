// server/routes/userRoute.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  registerUser,
  authUser,
  getUsers,
  updateUser,
  getUser,
  changePassword,
  deleteUser,
  resetPassword,
  getPublicProfile, // ✅ أضفنا هذه
} = require("../controllers/userController");

const {
  protect,
  authorize,
  protectRegisterUser,
} = require("../middlewares/authMiddleware");

// تأكد أن مجلد الرفع موجود
const uploadDir = path.join(__dirname, "../uploads/profileImages");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

// إنشاء مستخدم (عامة) + رفع صورة اختيارية
router
  .route("/")
  .post(upload.single("profileImage"), registerUser)
  .get(protect, authorize("admin"), getUsers);

router.post("/login", authUser);

router
  .route("/profile")
  .put(protect, upload.single("profileImage"), updateUser)
  .get(protect, getUser)
  .delete(protect, deleteUser);

router.put("/change-password", protect, changePassword);
router.put("/reset-password", protectRegisterUser, resetPassword);

// 📌 بروفايل عام لأي مستخدم (بدون protect)
// مثال: GET /api/users/66abc1234f.../public-profile
router.get("/:userId/public-profile", getPublicProfile);

module.exports.userRoutes = router;
