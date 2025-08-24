// server/middlewares/upload.js
const fs = require("fs");
const path = require("path");

const multer = require("multer");

/* الجذر الوحيد لكل الرفع */
const UP_ROOT = path.join(__dirname, "..", "uploads");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/* أنشئ شجرة المجلدات مرة عند تشغيل السيرفر */
function ensureUploadTree() {
  ensureDir(UP_ROOT);
  [
    "donationRequests", // طلبات التبرع العامة
    "blood-requests", // طلبات الدم
    "donationRequestConfirmations", // تأكيدات/عروض طلبات التبرع العامة
    "confirmationProofs", // أي إثباتات عامة أخرى
    "confirmations", // (إن أردتها لاستخدام آخر)
    "profileImages", // صور الملف الشخصي
  ].forEach((d) => ensureDir(path.join(UP_ROOT, d)));
}

function makeStorage(subFolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UP_ROOT, subFolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, "-")
        .slice(0, 60);
      cb(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`,
      );
    },
  });
}

function makeUploader(subFolder) {
  return multer({
    storage: makeStorage(subFolder),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });
}

/* رافعات جاهزة حسب النوع */
const uploadDonationReq = makeUploader("donationRequests");
const uploadDonationConfirm = makeUploader("donationRequestConfirmations");
const uploadBloodReq = makeUploader("blood-requests");
const uploadConfirmationProofs = makeUploader("confirmationProofs");

module.exports = {
  // مهم: التصدير بالاسم الصحيح ليستوردها server.js
  ensureUploadTree,
  // رافعات
  uploadDonationReq,
  uploadDonationConfirm,
  uploadBloodReq,
  uploadConfirmationProofs,
  // يبقى متاحًا إن احتجته
  UP_ROOT,
};
