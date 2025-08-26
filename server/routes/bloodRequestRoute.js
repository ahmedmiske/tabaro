// server/routes/bloodRequestRoute.js
const fs = require("fs");
const path = require("path");

const express = require("express");
// const mongoose = require("mongoose");

const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
} = require("../controllers/bloodRequestController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadBloodReq } = require("../middlewares/upload");

const router = express.Router();
// const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

/* يقبل docs و files لتجنّب MulterError */
const uploadDocs = uploadBloodReq.fields([
  { name: "docs", maxCount: 5 },
  { name: "files", maxCount: 5 },
]);

router.get("/", async (req, res, next) => {
  try {
    const {
      status = "all",
      page = 1,
      limit = 12,
      bloodType,
      isUrgent,
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const filter = {};
    if (status === "active") filter.deadline = { $gte: new Date() };
    if (status === "inactive") filter.deadline = { $lt: new Date() };
    if (bloodType) filter.bloodType = bloodType;
    if (isUrgent !== undefined) filter.isUrgent = String(isUrgent) === "true";

    req.query.page = String(p);
    req.query.limit = String(l);
    req._extraFilter = filter;

    return getBloodRequests(req, res, next);
  } catch (e) {
    next(e);
  }
});

router.post("/", protect, uploadDocs, createBloodRequest);
router.get("/:id", getBloodRequestById);
router.put("/:id", protect, uploadDocs, updateBloodRequest);
router.delete("/:id", protect, deleteBloodRequest);

/* تقديم الملفات inline من server/uploads/blood-requests */
router.get("/docs/file/:filename", (req, res) => {
  const safeName = path.basename(req.params.filename || "");
  const filePath = path.join(
    __dirname,
    "..",
    "uploads",
    "blood-requests",
    safeName,
  );

  if (!safeName || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  const ext = path.extname(safeName).toLowerCase();
  if (ext === ".pdf") res.type("application/pdf");
  if (ext === ".jpg" || ext === ".jpeg") res.type("image/jpeg");
  if (ext === ".png") res.type("image/png");

  res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
  return res.sendFile(filePath);
});

module.exports = router;
