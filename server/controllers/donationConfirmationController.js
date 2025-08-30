const mongoose = require("mongoose");
const BloodRequest = require("../models/bloodRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const Notification = require("../models/Notification");

/** إنشاء عرض تبرع لطلب دم */
async function createDonationConfirmation(req, res) {
  try {
    const donor = req.user?._id;
    if (!donor) return res.status(401).json({ message: "غير مصرح" });

    const { requestId, message, method, proposedTime } = req.body;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "requestId غير صالح" });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "طلب التبرع غير موجود" });

    if (String(request.userId) === String(donor)) {
      return res.status(400).json({ message: "لا يمكنك إرسال عرض على طلبك الخاص." });
    }

    const confirmation = await DonationConfirmation.create({
      donor,
      recipientId: request.userId,
      requestId,
      message,
      method: method || "call",
      status: "pending", // قيد الاستلام
      proposedTime: proposedTime ? new Date(proposedTime) : new Date(),
    });

    await Notification.create({
      userId: request.userId,
      title: "عرض تبرع جديد",
      message: "وصلك عرض تبرع على طلب الدم الخاص بك.",
      read: false,
      type: "donation_offer",
      referenceId: confirmation._id
    });

    res.status(201).json({ message: "تم إرسال عرض التبرع بنجاح", confirmation });
  } catch (err) {
    console.error("❌ createDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
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
    c.status = "accepted"; // يظل يظهر كـ "قيد الاستلام" بالواجهة
    c.acceptedAt = new Date();
    await c.save();
    res.json({ message: "تم تحديث العرض إلى قيد الاستلام (مقبول داخليًا)" });
  } catch (err) {
    console.error("❌ acceptDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** تأكيد الاستلام (صاحب الطلب فقط) */
async function markAsFulfilled(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const c = await DonationConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });

    if (String(c.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح: فقط صاحب الطلب يمكنه تأكيد الاستلام" });
    }

    c.status = "fulfilled";
    c.fulfilledAt = new Date();
    await c.save();

    await Notification.create({
      userId: c.donor,
      title: "تم تأكيد استلام التبرع",
      message: "تم تأكيد استلام تبرعك من طرف صاحب الطلب. شكرًا لعطائك.",
      read: false,
      type: "donation_fulfilled",
      referenceId: c._id
    });

    res.json({ message: "تم تأكيد التبرع كمنفذ", confirmation: c });
  } catch (err) {
    console.error("❌ markAsFulfilled:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** تقييم (المتبرع أو المتلقي) */
async function rateDonation(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const c = await DonationConfirmation.findById(id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });

    const { rating } = req.body;
    if (rating == null) return res.status(400).json({ message: "الرجاء إرسال قيمة التقييم" });

    if (String(req.user._id) === String(c.donor)) {
      c.ratingByDonor = rating;
    } else if (String(req.user._id) === String(c.recipientId)) {
      c.ratingByRecipient = rating;
    } else {
      return res.status(403).json({ message: "غير مصرح للتقييم" });
    }

    c.status = "rated";
    await c.save();
    res.json({ message: "تم حفظ التقييم", confirmation: c });
  } catch (err) {
    console.error("❌ rateDonation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** العروض التي تلقيتها */
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

/** العروض التي أرسلتها */
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

module.exports = {
  createDonationConfirmation,
  acceptDonationConfirmation,
  markAsFulfilled,
  rateDonation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelDonationConfirmation,
};
