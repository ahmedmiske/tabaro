// server/routes/adminRoute.js
const express = require("express");
const router = express.Router();

const {
  // ==== المستخدمون ====
  getAdminUsers,
  updateUserStatus,
  deleteUser,

  // ==== طلبات التبرع بالدم ====
  getAdminBloodRequests,
  updateBloodRequestStatus,
  deleteBloodRequest,

  // ==== طلبات التبرع العام ====
  getAdminGeneralRequests,
  updateGeneralRequestStatus,
  deleteGeneralRequest,

  // ==== عروض الاستعداد للتبرع بالدم ====
  getAdminBloodOffers,
  updateBloodOfferStatus,
  deleteBloodOffer,

  // ==== عروض الاستعداد للتبرع العام ====
  getAdminGeneralOffers,
  updateGeneralOfferStatus,
  deleteGeneralOffer,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middlewares/authMiddleware");

// كل مسارات /api/admin محمية للمشرف فقط
router.use(protect, authorize("admin"));

/* ========= المستخدمون ========= */
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

/* ========= طلبات التبرع بالدم ========= */
router.get("/blood-requests", getAdminBloodRequests);
router.patch("/blood-requests/:id/status", updateBloodRequestStatus);
router.delete("/blood-requests/:id", deleteBloodRequest);

/* ========= طلبات التبرع العام ========= */
router.get("/general-requests", getAdminGeneralRequests);
router.patch("/general-requests/:id/status", updateGeneralRequestStatus);
router.delete("/general-requests/:id", deleteGeneralRequest);

/* ========= عروض الاستعداد للتبرع بالدم ========= */
router.get("/blood-offers", getAdminBloodOffers);
router.patch("/blood-offers/:id/status", updateBloodOfferStatus);
router.delete("/blood-offers/:id", deleteBloodOffer);

/* ========= عروض الاستعداد للتبرع العام ========= */
router.get("/general-offers", getAdminGeneralOffers);
router.patch("/general-offers/:id/status", updateGeneralOfferStatus);
router.delete("/general-offers/:id", deleteGeneralOffer);

module.exports = router;
