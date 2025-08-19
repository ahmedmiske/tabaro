// server/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subFolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', subFolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, '_')
        .slice(0, 60);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
    },
  });
}

function makeUploader(subFolder) {
  return multer({
    storage: makeStorage(subFolder),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });
}

// 🔹 رافع عام (لو احتجته)
const upload = makeUploader('misc');

// 🔹 لطلبات الدم (عدّل أسماء الحقول حسب تطبيقك)
const uploadBloodDocs = makeUploader('blood')
  .fields([
    { name: 'proofDocuments', maxCount: 10 },
    { name: 'medicalReports',  maxCount: 10 },
  ]);

// 🔹 لتأكيدات التبرّع العامة (رفع متعدد بنفس اسم الحقل "files")
const uploadConfirmationDocs = makeUploader('confirmations')
  .array('files', 10);

module.exports = {
  upload,                  // إن احتجت الاستعمال اليدوي
  uploadBloodDocs,         // bloodRequestRoute
  uploadConfirmationDocs,  // donationRequestConfirmationRoutes
};
