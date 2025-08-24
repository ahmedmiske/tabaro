// server/controllers/donationConfirmationController.js
const BloodRequest = require("../models/bloodRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const Notification = require("../models/Notification");

/** إنشاء عرض تبرع لطلب دم */
async function createDonationConfirmation(req, res) {
  try {
    const donor = req.user?._id;
    if (!donor) return res.status(401).json({ message: "غير مصرح" });

    const { requestId, message, method, proposedTime } = req.body;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "طلب التبرع غير موجود" });

    // لا تسمح بالتبرع لنفس طلبك
    if (String(request.userId) === String(donor)) {
      return res.status(400).json({ message: "لا يمكنك إرسال عرض على طلبك الخاص." });
    }

    const confirmation = await DonationConfirmation.create({
      donor,
      recipientId: request.userId,
      requestId,
      message,
      method: method || "call",
      status: "pending",
      proposedTime: proposedTime ? new Date(proposedTime) : new Date(),
    });

    // إشعار صاحب الطلب
    await Notification.create({
      userId: request.userId,
      title: "عرض تبرع جديد",
      message: "وصلك عرض تبرع على طلب الدم الخاص بك.",
      read: false,
    });

    res.status(201).json({ message: "تم إرسال عرض التبرع بنجاح", confirmation });
  } catch (err) {
    console.error("❌ createDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

/** قبول العرض (ما زال مستخدمًا في مسار الدم) */
async function acceptDonationConfirmation(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id).populate("donor requestId");
    if (!c) return res.status(404).json({ message: "العرض غير موجود" });
    if (String(c.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    c.status = "accepted";
    c.acceptedAt = new Date();
    await c.save();
    res.json({ message: "تم قبول العرض" });
  } catch (err) {
    console.error("❌ acceptDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

async function rejectDonationConfirmation(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "العرض غير موجود" });
    if (String(c.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    c.status = "rejected";
    await c.save();
    res.json({ message: "تم رفض العرض" });
  } catch (err) {
    console.error("❌ rejectDonationConfirmation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

async function markAsFulfilled(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });
    c.status = "fulfilled";
    c.fulfilledAt = new Date();
    await c.save();
    res.json({ message: "تم تأكيد التبرع كمنفذ", confirmation: c });
  } catch (err) {
    console.error("❌ markAsFulfilled:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

async function rateDonation(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "لا يوجد سجل للتبرع" });
    const { rating } = req.body;
    if (String(req.user._id) === String(c.donor)) c.ratingByDonor = rating;
    else c.ratingByRecipient = rating;
    c.status = "rated";
    await c.save();
    res.json({ message: "تم حفظ التقييم", confirmation: c });
  } catch (err) {
    console.error("❌ rateDonation:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

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

async function getOffersByRequestId(req, res) {
  try {
    const list = await DonationConfirmation.find({ requestId: req.params.requestId })
      .populate("donor", "firstName lastName email phoneNumber")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error("❌ getOffersByRequestId:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
}

async function cancelDonationConfirmation(req, res) {
  try {
    const c = await DonationConfirmation.findById(req.params.id);
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
  rejectDonationConfirmation,
  markAsFulfilled,
  rateDonation,
  getMyDonationOffers,
  getMySentOffers,
  getOffersByRequestId,
  cancelDonationConfirmation,
};
