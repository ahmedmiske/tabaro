// server/controllers/adminController.js
const asyncHandler = require("express-async-handler");

// موديلات المستخدمين والطلبات
const User = require("../models/user");
const BloodRequest = require("../models/bloodRequest");
const DonationRequest = require("../models/DonationRequest");

// موديلات العروض (استعداد للتبرع)
const ReadyToDonateBlood = require("../models/ReadyToDonateBlood");
const ReadyToDonateGeneral = require("../models/ReadyToDonateGeneral");

// (اختياري) موديلات العروض المرتبطة بالطلبات - إن احتجتها لاحقاً
// const DonationConfirmation = require("../models/DonationConfirmation");
// const DonationRequestConfirmation = require("../models/DonationRequestConfirmation");

// =============== Helpers عامة ===============

// 404 موحّد
function notFoundResource(res, message = "المورد غير موجود") {
  res.status(404);
  throw new Error(message);
}

// إضافة action إلى historyActions لأي document
function addHistoryAction(doc, payload) {
  doc.historyActions = doc.historyActions || [];
  doc.historyActions.push({
    action: payload.action,           // مثلاً: admin_toggle / admin_delete ...
    by: payload.by || null,           // ObjectId للمستخدم (الأدمن)
    role: payload.role || "admin",    // admin / user ...
    fromStatus: payload.fromStatus,
    toStatus: payload.toStatus,
    reason: payload.reason,
    note: payload.note,
    createdAt: new Date(),
  });
}

// =============== المستخدمون ===============

// GET /api/admin/users
exports.getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ data: users });
});

// PATCH /api/admin/users/:id/status
// body: { status? }  => إن لم يُرسل status يتم الـ toggle بين verified / suspended
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const user = await User.findById(id);
  if (!user) {
    return notFoundResource(res, `المستخدم غير موجود: ${id}`);
  }

  if (status) {
    user.status = status;
  } else {
    user.status = user.status === "suspended" ? "verified" : "suspended";
  }

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

// =============== طلبات التبرع بالدم ===============

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
// body: { status? , reason? }
// إن لم يُرسل status يتم التبديل بين active / paused
exports.updateBloodRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const bloodReq = await BloodRequest.findById(id);
  if (!bloodReq) {
    return notFoundResource(res, `طلب الدم غير موجود: ${id}`);
  }

  const oldStatus = bloodReq.status || (bloodReq.isActive ? "active" : "paused");
  let newStatus = status;

  // toggle بسيط إن لم يأتِ status
  if (!newStatus) {
    newStatus = oldStatus === "active" ? "paused" : "active";
  }

  // نحن نحافظ على isActive للتوافق مع الكود القديم
  bloodReq.isActive = newStatus === "active";
  bloodReq.status = newStatus;

  if (newStatus !== "active") {
    bloodReq.closedReason = (reason || bloodReq.closedReason || "").trim();
    bloodReq.closedAt = bloodReq.closedAt || new Date();
    bloodReq.closedBy = req.user?._id || bloodReq.closedBy || null;
  }

  addHistoryAction(bloodReq, {
    action: "admin_toggle",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason,
  });

  await bloodReq.save();

  res.json({
    message: "تم تحديث حالة طلب التبرع بالدم بنجاح.",
    data: bloodReq,
  });
});

// DELETE /api/admin/blood-requests/:id
// نحوله إلى cancelled مع حفظ الأرشيف ولا نحذف من القاعدة
exports.deleteBloodRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  const bloodReq = await BloodRequest.findById(id);
  if (!bloodReq) {
    return notFoundResource(res, `طلب الدم غير موجود: ${id}`);
  }

  const oldStatus = bloodReq.status || (bloodReq.isActive ? "active" : "paused");

  bloodReq.isActive = false;
  bloodReq.status = "cancelled";
  bloodReq.closedReason = (reason || bloodReq.closedReason || "").trim();
  bloodReq.closedAt = bloodReq.closedAt || new Date();
  bloodReq.closedBy = req.user?._id || bloodReq.closedBy || null;

  addHistoryAction(bloodReq, {
    action: "admin_delete",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: "cancelled",
    reason: bloodReq.closedReason,
  });

  await bloodReq.save();

  res.json({
    message: "تم إلغاء طلب التبرع بالدم مع حفظ الأرشيف.",
    id,
  });
});

// =============== طلبات التبرع العام ===============

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
// body: { status? , reason? }
// إن لم يُرسل status يتم toggle بين active / paused
exports.updateGeneralRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const request = await DonationRequest.findById(id);
  if (!request) {
    return notFoundResource(res, `طلب التبرع غير موجود: ${id}`);
  }

  const oldStatus = request.status || "active";
  let newStatus = status;

  if (!newStatus) {
    newStatus = oldStatus === "active" ? "paused" : "active";
  }

  request.status = newStatus;

  if (newStatus !== "active") {
    request.closedReason = (reason || request.closedReason || "").trim();
    request.closedAt = request.closedAt || new Date();
  }

  addHistoryAction(request, {
    action: "admin_toggle",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason,
  });

  await request.save();

  res.json({
    message: "تم تحديث حالة طلب التبرع العام بنجاح.",
    data: request,
  });
});

// DELETE /api/admin/general-requests/:id
exports.deleteGeneralRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  const request = await DonationRequest.findById(id);
  if (!request) {
    return notFoundResource(res, `طلب التبرع غير موجود: ${id}`);
  }

  const oldStatus = request.status || "active";

  request.status = "cancelled";
  request.closedReason = (reason || request.closedReason || "").trim();
  request.closedAt = request.closedAt || new Date();

  addHistoryAction(request, {
    action: "admin_delete",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: "cancelled",
    reason: request.closedReason,
  });

  await request.save();

  res.json({
    message: "تم إلغاء طلب التبرع العام مع حفظ الأرشيف.",
    id,
  });
});

// =============== عروض الاستعداد للتبرع بالدم ===============

// GET /api/admin/blood-offers
exports.getAdminBloodOffers = asyncHandler(async (req, res) => {
  const offers = await ReadyToDonateBlood.find()
    .populate(
      "createdBy",
      "firstName lastName username phoneNumber whatsappNumber"
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: offers });
});

// PATCH /api/admin/blood-offers/:id/status
// body: { status? , reason? }
// toggle بين active / paused إذا لم يُرسل status
exports.updateBloodOfferStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const offer = await ReadyToDonateBlood.findById(id);
  if (!offer) {
    return notFoundResource(res, `عرض الاستعداد للتبرع بالدم غير موجود: ${id}`);
  }

  const oldStatus = offer.status || "active";
  let newStatus = status;

  if (!newStatus) {
    newStatus = oldStatus === "active" ? "paused" : "active";
  }

  offer.status = newStatus;

  addHistoryAction(offer, {
    action: "admin_toggle",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason,
  });

  await offer.save();

  res.json({
    message: "تم تحديث حالة عرض الاستعداد للتبرع بالدم.",
    data: offer,
  });
});

// DELETE /api/admin/blood-offers/:id
exports.deleteBloodOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  const offer = await ReadyToDonateBlood.findById(id);
  if (!offer) {
    return notFoundResource(res, `عرض الاستعداد للتبرع بالدم غير موجود: ${id}`);
  }

  const oldStatus = offer.status || "active";

  offer.status = "cancelled";

  addHistoryAction(offer, {
    action: "admin_delete",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: "cancelled",
    reason,
  });

  await offer.save();

  res.json({
    message: "تم إلغاء عرض الاستعداد للتبرع بالدم مع حفظ الأرشيف.",
    id,
  });
});

// =============== عروض الاستعداد للتبرع العام ===============

// GET /api/admin/general-offers
exports.getAdminGeneralOffers = asyncHandler(async (req, res) => {
  const offers = await ReadyToDonateGeneral.find()
    .populate(
      "createdBy",
      "firstName lastName username phoneNumber whatsappNumber"
    )
    .sort({ createdAt: -1 })
    .lean();

  res.json({ data: offers });
});

// PATCH /api/admin/general-offers/:id/status
exports.updateGeneralOfferStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const offer = await ReadyToDonateGeneral.findById(id);
  if (!offer) {
    return notFoundResource(res, `عرض الاستعداد للتبرع العام غير موجود: ${id}`);
  }

  const oldStatus = offer.status || "active";
  let newStatus = status;

  if (!newStatus) {
    newStatus = oldStatus === "active" ? "paused" : "active";
  }

  offer.status = newStatus;

  addHistoryAction(offer, {
    action: "admin_toggle",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: newStatus,
    reason,
  });

  await offer.save();

  res.json({
    message: "تم تحديث حالة عرض الاستعداد للتبرع العام.",
    data: offer,
  });
});

// DELETE /api/admin/general-offers/:id
exports.deleteGeneralOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};

  const offer = await ReadyToDonateGeneral.findById(id);
  if (!offer) {
    return notFoundResource(res, `عرض الاستعداد للتبرع العام غير موجود: ${id}`);
  }

  const oldStatus = offer.status || "active";

  offer.status = "cancelled";

  addHistoryAction(offer, {
    action: "admin_delete",
    by: req.user?._id || null,
    role: "admin",
    fromStatus: oldStatus,
    toStatus: "cancelled",
    reason,
  });

  await offer.save();

  res.json({
    message: "تم إلغاء عرض الاستعداد للتبرع العام مع حفظ الأرشيف.",
    id,
  });
});
