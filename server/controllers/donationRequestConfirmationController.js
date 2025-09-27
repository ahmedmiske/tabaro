const mongoose = require("mongoose");
const DonationRequest = require("../models/DonationRequest");
const DonationRequestConfirmation = require("../models/DonationRequestConfirmation");
const { notifyUser } = require("../utils/notify");

/** إنشاء تأكيد تبرع عام */
exports.createConfirmation = async (req, res) => {
  try {
    const donorId = req.user?._id || req.user?.id;
    if (!donorId) return res.status(401).json({ message: "غير مصرح" });

    const { requestId, message, amount, method, proposedTime } = req.body;
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "requestId غير صالح" });
    }

    // جمع الملفات المرفوعة (اسم الحقل: files)
    const files = [];
    if (req.files?.files) {
      for (const f of req.files.files) files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (Array.isArray(req.files)) {
      for (const f of req.files) files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (req.file) {
      files.push(`/uploads/donationRequestConfirmations/${req.file.filename}`);
    }

    const doc = await DonationRequestConfirmation.create({
      donor: donorId,
      requestId,
      message: (message || "").trim(),
      amount: amount ? Number(amount) : 0,
      method: method || "call",
      proposedTime: proposedTime ? new Date(proposedTime) : new Date(),
      proofFiles: files,
      status: "pending",
    });

    // إشعار صاحب الطلب
    const request = await DonationRequest.findById(requestId).select("userId category type");
    if (request?.userId) {
      await notifyUser({
        app: req.app,
        userId: request.userId,
        sender: donorId,
        title: "تأكيد تبرع جديد",
        message: (message && message.trim())
          ? message.trim()
          : `تلقّيت تأكيد تبرع لطلبك ${request?.category || ""}${request?.type ? ` (${request.type})` : ""}`,
        type: "donation_request_confirmation",
        referenceId: doc._id,
      });
    }

    return res.status(201).json({ message: "تم إنشاء التأكيد", data: doc });
  } catch (e) {
    console.error("createConfirmation error:", e);
    return res.status(500).json({ message: "فشل إنشاء التأكيد", error: e.message });
  }
};

/** (اختياري) قبول داخلي للتوافق — الواجهة لا تستخدمه */
exports.acceptConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "معرّف غير صالح" });

    const c = await DonationRequestConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "التأكيد غير موجود" });

    const reqDoc = await DonationRequest.findById(c.requestId).select("userId");
    if (!reqDoc || String(reqDoc.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    c.status = "accepted";
    c.acceptedAt = new Date();
    await c.save();

    res.json({ message: "تم التحديث إلى قيد الاستلام", data: c });
  } catch (e) {
    console.error("acceptConfirmation error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** تأكيد الاستلام (المتلقي فقط) */
exports.fulfillConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "معرّف غير صالح" });

    const c = await DonationRequestConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "التأكيد غير موجود" });

    const reqDoc = await DonationRequest.findById(c.requestId).select("userId");
    if (!reqDoc || String(reqDoc.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح: فقط صاحب الطلب" });
    }

    c.status = "fulfilled";
    c.fulfilledAt = new Date();
    await c.save();

    res.json({ message: "تم تأكيد الاستلام", data: c });
  } catch (e) {
    console.error("fulfillConfirmation error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** تقييم */
exports.rateConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "معرّف غير صالح" });

    const c = await DonationRequestConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "التأكيد غير موجود" });

    const { rating } = req.body || {};
    if (rating == null) return res.status(400).json({ message: "الرجاء إرسال التقييم" });

    const reqDoc = await DonationRequest.findById(c.requestId).select("userId");
    if (String(req.user._id) === String(c.donor)) c.ratingByDonor = rating;
    else if (reqDoc && String(reqDoc.userId) === String(req.user._id)) c.ratingByRecipient = rating;
    else return res.status(403).json({ message: "غير مصرح للتقييم" });

    c.status = "rated";
    await c.save();

    res.json({ message: "تم حفظ التقييم", data: c });
  } catch (e) {
    console.error("rateConfirmation error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** العروض التي تلقيتها (أنا صاحب الطلب) */
exports.getMyDonationOffers = async (req, res) => {
  try {
    const myRequests = await DonationRequest.find({ userId: req.user._id }).select("_id");
    const ids = myRequests.map(r => r._id);
    const items = await DonationRequestConfirmation.find({ requestId: { $in: ids } })
      .populate("donor", "firstName lastName email phoneNumber profileImage rating averageRating")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error("getMyDonationOffers error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** العروض التي أرسلتها (أنا المتبرع) */
exports.getMySentOffers = async (req, res) => {
  try {
    const items = await DonationRequestConfirmation.find({ donor: req.user._id })
      .populate({
        path: "requestId",
        model: "DonationRequest",
        populate: { path: "userId", model: "User", select: "firstName lastName profileImage rating averageRating" },
      })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error("getMySentOffers error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** العروض حسب رقم الطلب */
exports.getOffersByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) return res.status(400).json({ message: "requestId غير صالح" });

    const list = await DonationRequestConfirmation.find({ requestId })
      .populate("donor", "firstName lastName email phoneNumber profileImage rating averageRating")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    console.error("getOffersByRequestId error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** إلغاء التأكيد (المتبرع فقط قبل المعالجة) */
exports.cancelConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "معرّف غير صالح" });

    const c = await DonationRequestConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "التأكيد غير موجود" });
    if (String(c.donor) !== String(req.user._id)) return res.status(403).json({ message: "غير مصرح" });
    if (c.status !== "pending") return res.status(400).json({ message: "لا يمكن إلغاء التأكيد بعد معالجته" });

    await c.deleteOne();
    res.json({ message: "تم الإلغاء" });
  } catch (e) {
    console.error("cancelConfirmation error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/** ✅ جديد: جلب تأكيد طلب تبرّع واحد بالمعرّف */
exports.getDonationRequestConfirmationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const doc = await DonationRequestConfirmation.findById(id)
      .populate({
        path: "requestId",
        model: "DonationRequest",
        select: "title category type deadline userId",
        populate: { path: "userId", model: "User", select: "firstName lastName profileImage" },
      })
      .populate({ path: "donor", select: "firstName lastName profileImage" })
      .lean();

    if (!doc) return res.status(404).json({ message: "غير موجود" });

    return res.json({ data: doc });
  } catch (e) {
    console.error("getDonationRequestConfirmationById error:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};
