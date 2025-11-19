const mongoose = require("mongoose");
const BloodRequest = require("../models/bloodRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const Notification = require("../models/Notification");
const {
  updateUserRatingAsRecipient,
  updateUserRatingAsDonor,
} = require("./ratingHelpers");

/** إنشاء عرض تبرع لطلب دم (مرّة واحدة لكل متبرّع/طلب) */
async function createDonationConfirmation(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "غير مصرح" });

    const { requestId, message, method, proposedTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "requestId غير صالح" });
    }

    const request = await BloodRequest.findById(requestId).lean();
    if (!request) return res.status(404).json({ message: "طلب غير موجود" });

    if (String(request.userId) === String(userId)) {
      return res.status(400).json({ message: "لا يمكنك إعلان التبرع لطلبك." });
    }

    const existing = await DonationConfirmation.findOne({ requestId, donor: userId });
    if (existing) {
      return res.status(200).json({ already: true, id: existing._id });
    }

    const allowed = ["call", "phone", "whatsapp", "chat"];
    const safeMethod = allowed.includes(method) ? method : "chat";

    const doc = await DonationConfirmation.create({
      requestId,
      donor: userId,
      recipientId: request.userId,
      message: message || "",
      method: safeMethod,
      proposedTime: proposedTime ? new Date(proposedTime) : undefined,
    });

    try {
      await Notification.create({
        userId: request.userId,
        title: "عرض تبرع جديد",
        message: "لديك عرض تبرع جديد على طلب الدم الخاص بك.",
        read: false,
        type: "donation_offer",
        referenceId: doc._id,
      });
    } catch (_) {}

    return res.status(201).json(doc);
  } catch (e) {
    console.error("createDonationConfirmation:", e);
    if (e.code === 11000) {
      return res.status(200).json({ already: true });
    }
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** (توافقي) قبول العرض — لا تستخدمه الواجهة */
async function acceptDonationConfirmation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }
    const c = await DonationConfirmation.findById(id).populate("donor requestId");
    if (!c) return res.status(404).json({ message: "العرض غير موجود" });
    if (String(c.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    c.status = "accepted";
    c.acceptedAt = new Date();
    await c.save();
    res.json({ message: "تم تحديث العرض إلى قيد الاستلام (مقبول داخليًا)" });
  } catch (err) {
    console.error("❌ acceptDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** تأكيد الاستلام (صاحب الطلب أو المتبرّع) */
async function markAsFulfilled(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });

    const isDonor = String(c.donor) === String(req.user._id);
    const isRecipient = String(c.recipientId) === String(req.user._id);
    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "غير مصرح: فقط صاحب الطلب أو المتبرع" });
    }

    if (c.status === "fulfilled" || c.status === "rated") {
      return res.json({ message: "محفوظ مسبقًا", confirmation: c });
    }

    c.status = "fulfilled";
    c.fulfilledAt = new Date();
    await c.save();

    try {
      await Notification.create({
        userId: isDonor ? c.recipientId : c.donor,
        title: "تم تأكيد التنفيذ",
        message: "تم تأكيد تنفيذ التبرع. يمكنك الآن إضافة التقييم.",
        read: false,
        type: "donation_fulfilled",
        referenceId: c._id,
      });
    } catch (_) {}

    res.json({ message: "تم تأكيد التبرع كمنفذ", confirmation: c });
  } catch (err) {
    console.error("❌ markAsFulfilled:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** تقييم (المتبرع أو المتلقي) */
async function rateDonation(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });

    let { rating } = req.body;
    rating = Number(rating);
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "قيمة التقييم يجب أن تكون بين 1 و 5" });
    }

    const isDonor = String(req.user._id) === String(c.donor);
    const isRecipient = String(req.user._id) === String(c.recipientId);
    if (!isDonor && !isRecipient) {
      return res.status(403).json({ message: "غير مصرح للتقييم" });
    }

    // حفظ التقييم في السجل
    if (isDonor) {
      c.ratingByDonor = rating;        // المتبرع يقيّم صاحب الطلب
    }
    if (isRecipient) {
      c.ratingByRecipient = rating;    // صاحب الطلب يقيّم المتبرع
    }

    // نعتبرها حالة "rated" طالما هناك تقييم واحد على الأقل
    c.status = "rated";
    await c.save();

    // 🔁 تحديث تقييم المستخدم الهدف:
    // - لو الحالي متبرع → يقيم صاحب الطلب → تحديث ratingAsRecipient لصاحب الطلب
    // - لو الحالي صاحب طلب → يقيم المتبرع → تحديث ratingAsDonor للمتبرع
    if (isDonor) {
      await updateUserRatingAsRecipient(c.recipientId);
    }
    if (isRecipient) {
      await updateUserRatingAsDonor(c.donor);
    }

    res.json({ message: "تم حفظ التقييم", confirmation: c });
  } catch (err) {
    console.error("❌ rateDonation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** العروض التي تلقيتها (أنا صاحب الطلب) */
async function getMyDonationOffers(req, res) {
  try {
    const items = await DonationConfirmation.find({ recipientId: req.user._id })
      .populate("donor", "firstName lastName")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ getMyDonationOffers:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** العروض التي أرسلتها (أنا المتبرع) */
async function getMySentOffers(req, res) {
  try {
    const items = await DonationConfirmation.find({ donor: req.user._id })
      .populate({
        path: "requestId",
        model: "BloodRequest",
        populate: { path: "userId", model: "User", select: "firstName lastName" },
      })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ getMySentOffers:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** العروض حسب الطلب */
async function getOffersByRequestId(req, res) {
  try {
    const { requestId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "requestId غير صالح" });
    }

    const list = await DonationConfirmation.find({ requestId })
      .populate("donor", "firstName lastName email phoneNumber")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("❌ getOffersByRequestId:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** إلغاء عرض (للمتبرع قبل الاستلام) */
async function cancelDonationConfirmation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const c = await DonationConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "العرض غير موجود" });
    if (String(c.donor) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    if (c.status !== "pending") {
      return res.status(400).json({ message: "لا يمكن إلغاء العرض بعد معالجته" });
    }
    await c.deleteOne();
    res.json({ message: "تم الإلغاء" });
  } catch (err) {
    console.error("❌ cancelDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** ✅ الحصول على تأكيد واحد بالمعرّف */
async function getDonationConfirmationById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const doc = await DonationConfirmation.findById(id)
      .populate({
        path: "requestId",
        model: "BloodRequest",
        select: "title bloodType deadline userId requestType kind category",
        populate: {
          path: "userId",
          model: "User",
          select: "firstName lastName profileImage ratingAsRecipient ratingAsDonor",
        },
      })
      .populate({
        path: "donor",
        select: "firstName lastName profileImage ratingAsDonor ratingAsRecipient",
      })
      .populate({
        path: "recipientId",
        select: "firstName lastName profileImage ratingAsDonor ratingAsRecipient",
      })
      .lean();

    if (!doc) return res.status(404).json({ message: "غير موجود" });

    return res.json({ data: doc });
  } catch (err) {
    console.error("❌ getDonationConfirmationById:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

module.exports = {
  createDonationConfirmation,
  acceptDonationConfirmation,
  markAsFulfilled,
  rateDonation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelDonationConfirmation,
  getDonationConfirmationById,
};
