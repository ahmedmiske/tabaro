// server/controllers/donationRequestController.js
const DonationRequest = require("../models/DonationRequest");
const DonationRequestConfirmation = require("../models/DonationRequestConfirmation");

// ===== أدوات مساعدة =====
const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";
const toNum = (v) =>
  v === "" || v === null || v === undefined ? null : Number(v);
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// --- قبول الصيغتين: الأقواس أو JSON ---
function parseBracketArray(body, root, fields) {
  const re = new RegExp(`^${root}\\[(\\d+)\\]\\[(${fields.join("|")})\\]$`);
  const map = new Map();
  for (const [key, val] of Object.entries(body)) {
    const m = key.match(re);
    if (!m) continue;
    const idx = Number(m[1]);
    const f = m[2];
    const obj = map.get(idx) || {};
    obj[f] = val;
    map.set(idx, obj);
  }
  return Array.from(map.keys())
    .sort((a, b) => a - b)
    .map((k) => map.get(k))
    .filter((o) =>
      Object.values(o).some((v) => String(v || "").trim() !== "")
    );
}

function parseFlexibleArray(body, root, fields) {
  // 1) جرّب الأقواس
  const bracket = parseBracketArray(body, root, fields);
  if (bracket.length) return bracket;

  // 2) جرّب JSON بسلسلة مفردة (contactMethods: "[{...}]")
  const raw = body[root];
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch {
      /* ignore */
    }
  }

  // 3) جرّب أن تكون مصفوفة جاهزة (قد يرسلها عميل آخر)
  if (Array.isArray(body[root])) {
    return body[root];
  }

  return [];
}

// استخراج مسارات الملفات حسب نوع رفع multer في الراوتر
function extractFiles(req) {
  if (req.files?.files)
    return req.files.files.map(
      (f) => `/uploads/donationRequests/${f.filename}`
    );
  if (Array.isArray(req.files))
    return req.files.map((f) => `/uploads/donationRequests/${f.filename}`);
  if (req.file) return [`/uploads/donationRequests/${req.file.filename}`];
  return [];
}

const PUBLISHER_SELECT = "firstName lastName profileImage createdAt";

// ===== إنشاء =====
exports.createDonationRequest = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId || null;
    if (!userId)
      return res.status(401).json({ message: "غير مصرح. سجل الدخول." });

    const {
      category,
      type,
      description,
      place,
      deadline,
      isUrgent,
      amount,
      bloodType,
    } = req.body;
    if (!category || !type)
      return res.status(400).json({ message: "الرجاء تحديد المجال والنوع." });
    if (!place)
      return res
        .status(400)
        .json({ message: "الرجاء تحديد الموقع (اسم المكان)." });

    // ✅ أصبح يقبل الأقواس أو JSON
    const contactMethods = parseFlexibleArray(req.body, "contactMethods", [
      "method",
      "number",
    ]);
    const paymentMethods = parseFlexibleArray(req.body, "paymentMethods", [
      "method",
      "phone",
    ]);
    const proofDocuments = extractFiles(req);

    const doc = await DonationRequest.create({
      userId,
      category,
      type,
      description,
      place: String(place).trim(),
      amount: toNum(amount),
      deadline: toDate(deadline),
      isUrgent: toBool(isUrgent),
      bloodType: bloodType || "",
      contactMethods,
      paymentMethods,
      proofDocuments,
      date: new Date(),
      status: "active", // افتراضي
    });

    const populated = await DonationRequest.findById(doc._id).populate({
      path: "userId",
      select: PUBLISHER_SELECT,
    });

    res
      .status(201)
      .json({ message: "تم إنشاء طلب التبرع بنجاح", data: populated });
  } catch (error) {
    console.error("❌ Create DonationRequest:", error);
    res
      .status(500)
      .json({ message: "فشل إنشاء طلب التبرع", error: error.message });
  }
};

// ===== قائمة مع فلترة وترقيم =====
exports.listDonationRequests = async (req, res) => {
  try {
    const {
      mine,
      category,
      type,
      place,
      urgent,
      page = 1,
      limit = 10,
      status, // ⬅️ جديد
    } = req.query;

    const q = {};

    // إذا mine=true → يعرض طلباتي، وإلا يعرض العامة
    if (mine && req.user?._id) {
      q.userId = req.user._id;
      if (status && status !== "all") {
        q.status = status;
      }
    } else {
      // القوائم العامة: افتراضيًا active فقط
      if (status && status !== "all") {
        q.status = status;
      } else {
        q.status = "active";
      }
    }

    if (category) q.category = category;
    if (type) q.type = type;
    if (place) q.place = place;
    if (urgent === "1") q.isUrgent = true;

    const _page = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Number(limit) || 10);
    const skip = (_page - 1) * _limit;

    const [items, total] = await Promise.all([
      DonationRequest.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_limit)
        .populate({ path: "userId", select: PUBLISHER_SELECT }),
      DonationRequest.countDocuments(q),
    ]);

    res.json({
      data: items,
      pagination: {
        page: _page,
        limit: _limit,
        total,
        pages: Math.ceil(total / _limit),
      },
    });
  } catch (error) {
    console.error("❌ List DonationRequests:", error);
    res.status(500).json({ message: "فشل جلب الطلبات", error: error.message });
  }
};

// ===== واحد =====
exports.getDonationRequest = async (req, res) => {
  try {
    const doc = await DonationRequest.findById(req.params.id).populate({
      path: "userId",
      select: PUBLISHER_SELECT,
    });

    if (!doc) return res.status(404).json({ message: "طلب التبرع غير موجود" });
    res.json({ data: doc });
  } catch (error) {
    console.error("❌ Get DonationRequest:", error);
    res.status(500).json({ message: "فشل جلب الطلب", error: error.message });
  }
};

// ===== تحديث =====
exports.updateDonationRequest = async (req, res) => {
  try {
    const data = {};
    const fields = [
      "category",
      "type",
      "description",
      "place",
      "deadline",
      "isUrgent",
      "amount",
      "bloodType",
      // لاحظ: لا نسمح بتعديل status هنا حتى لا يكسر منطق الإيقاف
    ];
    for (const f of fields) if (f in req.body) data[f] = req.body[f];

    if ("amount" in data) data.amount = toNum(data.amount);
    if ("deadline" in data) data.deadline = toDate(data.deadline);
    if ("isUrgent" in data) data.isUrgent = toBool(data.isUrgent);
    if ("place" in data) data.place = String(data.place || "").trim();

    const contactMethods = parseFlexibleArray(req.body, "contactMethods", [
      "method",
      "number",
    ]);
    const paymentMethods = parseFlexibleArray(req.body, "paymentMethods", [
      "method",
      "phone",
    ]);
    if (contactMethods.length) data.contactMethods = contactMethods;
    if (paymentMethods.length) data.paymentMethods = paymentMethods;

    const newFiles = extractFiles(req);
    if (newFiles.length) {
      const current = await DonationRequest.findById(req.params.id).select(
        "proofDocuments"
      );
      data.proofDocuments = [...(current?.proofDocuments || []), ...newFiles];
    }

    const updated = await DonationRequest.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).populate({ path: "userId", select: PUBLISHER_SELECT });
    if (!updated)
      return res.status(404).json({ message: "طلب التبرع غير موجود" });

    res.json({ message: "تم تعديل الطلب بنجاح", data: updated });
  } catch (error) {
    console.error("❌ Update DonationRequest:", error);
    res.status(500).json({ message: "فشل تعديل الطلب", error: error.message });
  }
};

// ===== حذف =====
exports.deleteDonationRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findByIdAndDelete(req.params.id);
    if (!request)
      return res.status(404).json({ message: "طلب التبرع غير موجود" });
    res.json({ message: "تم حذف الطلب بنجاح" });
  } catch (error) {
    console.error("❌ Delete DonationRequest:", error);
    res.status(500).json({ message: "فشل حذف الطلب", error: error.message });
  }
};

// ===== طلباتي مع العروض =====
exports.getMineWithOffers = async (req, res) => {
  try {
    const myId = req.user._id;

    const requests = await DonationRequest.find({ userId: myId })
      .sort({ createdAt: -1 })
      .lean();

    const ids = requests.map((r) => r._id);
    const confirmations = await DonationRequestConfirmation.find({
      requestId: { $in: ids },
    })
      .populate("donor", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    const grouped = confirmations.reduce((acc, c) => {
      const key = String(c.requestId);
      (acc[key] ||= []).push(c);
      return acc;
    }, {});

    const result = requests.map((r) => ({
      ...r,
      offers: grouped[String(r._id)] || [],
    }));
    res.json(result);
  } catch (e) {
    console.error("❌ getMineWithOffers (general):", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

// ===== إيقاف نشر طلب التبرع العام =====
exports.stopGeneralRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body;
    const userId = req.user._id;

    const reqDoc = await DonationRequest.findById(id);
    if (!reqDoc) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // تأكد أنه صاحب الطلب
    if (String(reqDoc.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "غير مسموح لك بإيقاف هذا الطلب" });
    }

    reqDoc.status = "paused";
    reqDoc.closedReason = reason;
    reqDoc.closedAt = new Date();

    await reqDoc.save();

    const populated = await DonationRequest.findById(reqDoc._id).populate({
      path: "userId",
      select: PUBLISHER_SELECT,
    });

    res.json({
      message: "تم إيقاف نشر الطلب، ولن يظهر في القوائم العامة.",
      data: populated,
    });
  } catch (err) {
    console.error("❌ stopGeneralRequest:", err);
    res
      .status(500)
      .json({ message: "خطأ أثناء إيقاف نشر الطلب", error: err.message });
  }
};
