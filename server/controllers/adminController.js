// server/controllers/adminController.js
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const BloodRequest = require("../models/bloodRequest.js");
const DonationRequest =require("../models/DonationRequest.js");

// ✅ مساعدة لرمي خطأ 404 واضح
function notFoundResource(res, message = "المورد غير موجود") {
  res.status(404);
  throw new Error(message);
}

/* ========== المستخدمون ========== */

// GET /api/admin/users
exports.getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ data: users });
});

// PATCH /api/admin/users/:id/status
// body: { status? , reason? }
// إن لم يُرسل status نعمل toggle بين verified / suspended
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const user = await User.findById(id);
  if (!user) {
    return notFoundResource(res, `المستخدم غير موجود: ${id}`);
  }

  if (status) {
    user.status = status;
  } else {
    // toggle بسيط
    user.status = user.status === "suspended" ? "verified" : "suspended";
  }

  // ملاحظة: سكيمة User الحالية لا تحتوي adminNote أو سبب،
  // لو أردت مستقبلاً يمكن إضافة حقل جديد في الـ Schema (مثلاً adminNote)
  // حالياً سنكتفي بتغيير الحالة فقط و تجاهل reason.

  await user.save();

  res.json({
    message: "تم تحديث حالة المستخدم بنجاح.",
    data: user,
  });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return notFoundResource(res, `المستخدم غير موجود: ${id}`);
  }

  await user.deleteOne();

  res.json({
    message: "تم حذف المستخدم بنجاح.",
    id,
  });
});

/* ========== طلبات التبرع بالدم ========== */

// GET /api/admin/blood-requests
exports.getAdminBloodRequests = asyncHandler(async (req, res) => {
  const bloodRequests = await BloodRequest.find()
    .populate(
      "userId",
      "firstName lastName username phoneNumber whatsappNumber"
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: bloodRequests });
});

// PATCH /api/admin/blood-requests/:id/status
// وأيضاً alias: PATCH /api/admin/blood-requests/:id/toggle-active
// body: { isActive? , reason? }
exports.updateBloodRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, reason } = req.body || {};

  const bloodReq = await BloodRequest.findById(id);
  if (!bloodReq) {
    return notFoundResource(res, `طلب الدم غير موجود: ${id}`);
  }

  // إن لم يُرسل isActive نبدّل القيمة الحالية (toggle)
  let newIsActive;
  if (typeof isActive === "boolean") {
    newIsActive = isActive;
  } else {
    newIsActive = !bloodReq.isActive;
  }

  bloodReq.isActive = newIsActive;

  // لو تم إيقاف الطلب، نحفظ سبب الإغلاق + وقت الإغلاق + من قام بالإغلاق (الأدمن)
  if (!newIsActive) {
    bloodReq.closedReason = (reason || bloodReq.closedReason || "").trim();
    bloodReq.closedAt = new Date();
    bloodReq.closedBy = req.user?._id || bloodReq.closedBy || null;
  } else {
    // في حال التفعيل من جديد يمكن تنظيف السبب (اختياري)
    // bloodReq.closedReason = "";
    // bloodReq.closedAt = null;
    // bloodReq.closedBy = null;
  }

  await bloodReq.save();

  res.json({
    message: "تم تحديث حالة طلب التبرع بالدم بنجاح.",
    data: bloodReq,
  });
});

// DELETE /api/admin/blood-requests/:id
exports.deleteBloodRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bloodReq = await BloodRequest.findById(id);
  if (!bloodReq) {
    return notFoundResource(res, `طلب الدم غير موجود: ${id}`);
  }

  await bloodReq.deleteOne();

  res.json({
    message: "تم حذف طلب التبرع بالدم بنجاح.",
    id,
  });
});

/* ========== طلبات التبرع العام ========== */

// GET /api/admin/general-requests
exports.getAdminGeneralRequests = asyncHandler(async (req, res) => {
  const generalRequests = await DonationRequest.find()
    .populate(
      "userId",
      "firstName lastName username phoneNumber whatsappNumber"
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: generalRequests });
});

// PATCH /api/admin/general-requests/:id/status
// وأيضاً alias: PATCH /api/admin/general-requests/:id/toggle-status
// body: { status? , reason? }
// status يمكن أن تكون: active / paused / completed / cancelled
// لو لم تُرسل status نعمل toggle بين active / paused فقط.
exports.updateGeneralRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const request = await DonationRequest.findById(id);
  if (!request) {
    return notFoundResource(res, `طلب التبرع غير موجود: ${id}`);
  }

  let newStatus = status;
  if (!newStatus) {
    // toggle بسيط بين active / paused
    newStatus = request.status === "active" ? "paused" : "active";
  }

  request.status = newStatus;

  // لو لم تعد الحالة "active" نحفظ سبب الإغلاق ووقته
  if (newStatus !== "active") {
    request.closedReason = (reason || request.closedReason || "").trim();
    request.closedAt = request.closedAt || new Date();
  } else {
    // في حال رجوع الطلب إلى active يمكن (اختياري) تنظيف سبب الإغلاق
    // request.closedReason = "";
    // request.closedAt = null;
  }

  await request.save();

  res.json({
    message: "تم تحديث حالة طلب التبرع العام بنجاح.",
    data: request,
  });
});

// DELETE /api/admin/general-requests/:id
exports.deleteGeneralRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await DonationRequest.findById(id);
  if (!request) {
    return notFoundResource(res, `طلب التبرع غير موجود: ${id}`);
  }

  await request.deleteOne();

  res.json({
    message: "تم حذف طلب التبرع العام بنجاح.",
    id,
  });
});
