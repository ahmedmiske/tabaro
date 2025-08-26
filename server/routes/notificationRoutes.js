// server/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, ctrl.createNotification);
router.get("/", protect, ctrl.getUserNotifications);
router.get("/unread-count", protect, ctrl.getUnreadNotificationCount);
router.patch("/:id/read", protect, ctrl.markNotificationAsRead);
router.post("/read-all", protect, ctrl.markAllAsRead);

module.exports = router;
