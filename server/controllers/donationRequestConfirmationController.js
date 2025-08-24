// server/controllers/donationRequestConfirmationController.js
const DonationRequest = require("../models/DonationRequest");
const DonationRequestConfirmation = require("../models/DonationRequestConfirmation");
const { notifyUser } = require("../utils/notify");

// ✅ إنشاء تأكيد تبرع (مسموح بالتكرار – كل تأكيد يُقبل تلقائيًا)
exports.createConfirmation = async (req, res) => {
  try {
    const donorId = req.user?._id || req.user?.id;
    if (!donorId) return res.status(401).json({ message: "غير مصرح" });

    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: "requestId مطلوب" });

    // جمع الملفات المرفوعة (نفس اسم الحقل المعرّف في الراوتر: files)
    const files = [];
    if (req.files?.files) {
      for (const f of req.files.files)
        files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (Array.isArray(req.files)) {
      for (const f of req.files)
        files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (req.file) {
      files.push(`/uploads/donationRequestConfirmations/${req.file.filename}`);
    }

    // ✅ نقبل التأكيد مباشرةً
    const doc = await DonationRequestConfirmation.create({
      donor: donorId,
      requestId,
      message: (req.body.message || "").trim(),
      amount: req.body.amount ? Number(req.body.amount) : 0,
      method: req.body.method || "call",
      proposedTime: req.body.proposedTime ? new Date(req.body.proposedTime) : new Date(),
      proofFiles: files,               // ← الاسم الصحيح طبقًا للـSchema
      status: "accepted",              // ← قيمة صالحة ضمن enum
    });

    // إشعار صاحب الطلب
    const request = await DonationRequest.findById(requestId).select("userId category type");
    if (request?.userId) {
      await notifyUser({
        app: req.app,
        userId: request.userId,
        sender: donorId,
        title: "تأكيد تبرع جديد",
        message:
          req.body.message && req.body.message.trim()
            ? req.body.message.trim()
            : `تلقّيت تأكيد تبرع لطلبك ${request?.category || ""}${request?.type ? ` (${request.type})` : ""}`,
        type: "donation_request_confirmation",
        referenceId: doc._id,
      });
    }

    // إشعار المتبرع نفسه
    await notifyUser({
      app: req.app,
      userId: donorId,
      sender: donorId,
      title: "تم إرسال تأكيدك",
      message: "لقد تم إشعار صاحب الطلب بتبرعكم ويمكنكم الآن التواصل عبر الوسائل المتاحة.",
      type: "info",
      referenceId: doc._id,
    });

    return res.status(201).json({ message: "تم إنشاء التأكيد", data: doc });
  } catch (e) {
    console.error("createConfirmation error:", e);
    return res.status(500).json({ message: "فشل إنشاء التأكيد", error: e.message });
  }
};

// ✅ جلب جميع التأكيدات لطلب معيّن + إرجاع عدد مرات تأكيد كل متبرّع لنفس الطلب
exports.listByRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await DonationRequestConfirmation.find({ requestId: id })
      .populate("donor", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // عدّ مرات التأكيد لكل متبرّع لهذا الطلب
    const countsByDonor = {};
    for (const it of list) {
      const k = String(it.donor?._id || it.donor);
      countsByDonor[k] = (countsByDonor[k] || 0) + 1;
    }

    const withCounts = list.map(it => ({
      ...it,
      timesByThisDonor: countsByDonor[String(it.donor?._id || it.donor)] || 1,
    }));

    return res.json({ data: withCounts });
  } catch (e) {
    console.error("listByRequest error:", e);
    return res.status(500).json({ message: "فشل الجلب", error: e.message });
  }
};
