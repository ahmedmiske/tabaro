// server/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// يحفظ داخل: <project-root>/uploads/blood-requests
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'blood-requests');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (_, file, cb) => {
  const ok = /^(image\/jpeg|image\/png|application\/pdf)$/i.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Only images (jpeg/png) and PDF files are allowed!'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 } // 5MB لكل ملف، حتى 5
});

module.exports = { upload };
