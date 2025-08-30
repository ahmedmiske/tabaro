const express = require("express");
const router = express.Router();

const {
  createDonationRequest,
  listDonationRequests,
  getDonationRequest,
  updateDonationRequest,
  deleteDonationRequest,
  getMineWithOffers, // ⬅️ الجديد
} = require("../controllers/donationRequestController");
const { protect } = require("../middlewares/authMiddleware");
const { uploadDonationReq } = require("../middlewares/upload");

const uploadReqDocs = uploadDonationReq.fields([{ name: "files", maxCount: 10 }]);

// ✅ ثابت قبل :id
router.get("/mine-with-offers", protect, getMineWithOffers);

router.get("/",  listDonationRequests);
router.get("/:id([0-9a-fA-F]{24})", getDonationRequest);

router.post("/", protect, uploadReqDocs, createDonationRequest);
router.put("/:id([0-9a-fA-F]{24})", protect, uploadReqDocs, updateDonationRequest);
router.delete("/:id([0-9a-fA-F]{24})", protect, deleteDonationRequest);

module.exports = router;
