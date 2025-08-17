const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');

const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
} = require('../controllers/donationRequestController');

const router = express.Router();

// --- Multer: uploads/donationRequests في جذر المشروع ---
const ensureDir = (dirPath) => {
  try { fs.mkdirSync(dirPath, { recursive: true }); } catch {}
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname = server/routes → نرجع لجذر المشروع ثم uploads/donationRequests
    const dest = path.join(__dirname, '..', '..', 'uploads', 'donationRequests');
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}.${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// --- Routes ---
router.post('/', protect, upload.array('files', 10), createDonationRequest);
router.get('/', listDonationRequests);
router.get('/:id', getDonationRequest);
router.put('/:id', protect, upload.array('files', 10), updateDonationRequest);
router.delete('/:id', protect, deleteDonationRequest);

module.exports = router;
