const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const BloodRequest = require("../models/bloodRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const { addHistory } = require("../utils/historyLogger");

/* ========= Helpers ========= */
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const toRel = (folder, f) => `/uploads/${folder}/${f.filename}`;
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// contactMethods[0][method]/[number] أو JSON كسلسلة
function parseBracketArray(body, root, fields) {
  const re = new RegExp(`^${root}\\[(\\d+)\\]\\[(${fields.join("|")})\\]$`);
  const map = new Map();
  for (const [k, val] of Object.entries(body)) {
    const m = k.match(re);
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
  const bracket = parseBracketArray(body, root, fields);
  if (bracket.length) return bracket;

  const raw = body[root];
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch {
      /* ignore */
    }
  }
  if (Array.isArray(body[root])) return body[root];
  return [];
}

// اجمع كائنات multer نفسها
function collectMulterFiles(req) {
  const out = [];
  if (req.files?.docs) out.push(...req.files.docs);
  if (req.files?.files) out.push(...req.files.files);
  if (Array.isArray(req.files)) out.push(...req.files);
  if (req.file) out.push(req.file);
  return out;
}

// حوّلها إلى كائنات تناسب الـSchema (subdocument)
function mapToDocumentObjects(multerFiles, folder = "blood-requests") {
  return multerFiles.map((f) => {
    const url = toRel(folder, f);
    return {
      url,
      path: url,
      name: f.originalname,
      mime: f.mimetype,
      size: f.size,
      uploadedAt: new Date(),
    };
  });
}

/* ========= CREATE ========= */
exports.createBloodRequest = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "غير مصرح" });
    }

    const {
      bloodType,
      description,
      location,     // النص الظاهر في الواجهة
      isUrgent,
      deadline,
      title,

      // اسم المستشفى المرسل من الفورم
      hospital,

      // موقع داخل موريتانيا؟
      isInsideMauritania,

      // من الفورم (داخل موريتانيا)
      wilayaCode,
      wilayaNameAr,
      moughataaCode,
      moughataaNameAr,
      communeCode,
      communeNameAr,

      // في حالة خارج موريتانيا (نضيفها لاحقاً في الفورم)
      countryCode,
      countryNameAr,
      fullAddress,
    } = req.body;

    const contactMethods = parseFlexibleArray(req.body, "contactMethods", [
      "method",
      "number",
    ]);

    const uploaded = collectMulterFiles(req);
    const documentObjs = mapToDocumentObjects(uploaded, "blood-requests");

    // ✅ نحسم هل هو داخل موريتانيا أم لا
    const insideMR =
      String(isInsideMauritania) === "true" || isInsideMauritania === true;

    // ✅ النص الذي سيظهر دائماً في الواجهة
    const finalLocation =
      (insideMR ? location : fullAddress || location) || "";

    const created = await BloodRequest.create({
      userId: req.user._id,

      title: title || undefined,
      bloodType: bloodType || undefined,
      description: description || undefined,

      // نص عام للموقع (يُعرض في الكروت / التفاصيل)
      location: finalLocation,

      // مستشفى (المكان بالتحديد)
      hospitalName: hospital || req.body.hospitalName || "",

      isUrgent: String(isUrgent) === "true" || isUrgent === true,
      deadline: toDate(deadline),

      contactMethods,
      documents: documentObjs,
      status: "active",

      // 🔹 منطق الموقع الجديد
      isInsideMauritania: insideMR,

      // إذا كان داخل موريتانيا نحفظ البلدية/المقاطعة/الولاية
      wilayaCode: insideMR ? (wilayaCode || "") : "",
      wilayaNameAr: insideMR ? (wilayaNameAr || "") : "",
      moughataaCode: insideMR ? (moughataaCode || "") : "",
      moughataaNameAr: insideMR ? (moughataaNameAr || "") : "",
      communeCode: insideMR ? (communeCode || "") : "",
      communeNameAr: insideMR ? (communeNameAr || "") : "",

      // إذا كان خارج موريتانيا نحفظ الدولة + العنوان النصي الكامل
      countryCode: insideMR ? "" : (countryCode || ""),
      countryNameAr: insideMR ? "" : (countryNameAr || ""),
      fullAddress: insideMR ? "" : (fullAddress || location || ""),
    });

    // ✅ سجل إنشاء الطلب
    addHistory(created, {
      action: "create",
      by: req.user._id,
      user: req.user._id,
      role: "user",
      fromStatus: null,
      toStatus: "active",
      note: "إنشاء طلب التبرع بالدم",
    });
    await created.save();

    const populated = await BloodRequest.findById(created._id).populate({
      path: "userId",
      model: "User",
      select: "firstName lastName profileImage phoneNumber email",
    });

    return res.status(201).json(populated);
  } catch (err) {
    console.error("❌ createBloodRequest:", err);
    return res
      .status(500)
      .json({ message: "خطأ في السيرفر", error: err.message });
  }
};


/* ========= LIST ========= */
exports.getBloodRequests = async (req, res) => {
  try {
    const { page = "1", limit = "12", status } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    let baseFilter = req._extraFilter || {};

    /** ------------------------------
     *  ⬇️ منطق status الأساسي
     * ------------------------------ **/

    if (!status || status === "active") {
      // افتراضياً تظهر فقط active
      baseFilter.status = "active";
    } else if (status === "inactive") {
      // inactive = paused + finished + cancelled
      baseFilter.status = { $in: ["paused", "finished", "cancelled"] };
    } else if (status === "all") {
      // لا نضيف أي فلتر
    } else {
      // أي قيمة محددة
      baseFilter.status = status;
    }

    /** إذا كانت الروت mine فلا نفلتر status */
    if (req.originalUrl.includes("/mine")) {
      delete baseFilter.status;
    }

    /** ------------------------------
     *  ⬇️ تنفيذ الاستعلام
     * ------------------------------ **/

    const total = await BloodRequest.countDocuments(baseFilter);

    const data = await BloodRequest.find(baseFilter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .populate({
        path: "userId",
        select: "firstName lastName profileImage",
      });

    return res.json({
      total,
      page: p,
      pages: Math.ceil(total / l),
      limit: l,
      data,
    });
  } catch (err) {
    console.error("❌ getBloodRequests:", err);
    return res
      .status(500)
      .json({ message: "خطأ في السيرفر", error: err.message });
  }
};


/* ========= READ ONE ========= */
exports.getBloodRequestById = async (req, res) => {
  try {
    const doc = await BloodRequest.findById(req.params.id).populate({
      path: "userId",
      model: "User",
      select: "firstName lastName profileImage phoneNumber email",
    });
    if (!doc)
      return res.status(404).json({ message: "طلب التبرع غير موجود" });
    res.json({ data: doc });
  } catch (e) {
    console.error("getBloodRequestById:", e);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/* ========= UPDATE ========= */
exports.updateBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: "غير موجود" });

    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const { bloodType, description, location, isUrgent, deadline, title } =
      req.body;
    if (title !== undefined) doc.title = title;
    if (bloodType !== undefined) doc.bloodType = bloodType;
    if (description !== undefined) doc.description = description;
    if (location !== undefined) doc.location = location;
    if (isUrgent !== undefined)
      doc.isUrgent = String(isUrgent) === "true" || isUrgent === true;
    if (deadline !== undefined) doc.deadline = toDate(deadline);

    const incomingContact = parseFlexibleArray(req.body, "contactMethods", [
      "method",
      "number",
    ]);
    if (incomingContact.length) doc.contactMethods = incomingContact;

    const uploaded = collectMulterFiles(req);
    if (uploaded.length) {
      const documentObjs = mapToDocumentObjects(uploaded, "blood-requests");
      doc.documents = [...(doc.documents || []), ...documentObjs];
    }

    await doc.save();

    const populated = await BloodRequest.findById(doc._id).populate({
      path: "userId",
      select: "firstName lastName profileImage phoneNumber email",
    });
    res.json(populated);
  } catch (err) {
    console.error("❌ updateBloodRequest:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/* ========= DELETE ========= */
exports.deleteBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ message: "معرّف غير صالح" });
    }

    const doc = await BloodRequest.findById(id);
    if (!doc) return res.status(404).json({ message: "غير موجود" });

    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const fromStatus = doc.status || (doc.isActive ? "active" : "paused");

    const fromDocs = (doc.documents || [])
      .map((d) => d?.url || d?.path)
      .filter(Boolean);
    const legacy = doc.files || [];
    const delFiles = Array.from(new Set([...fromDocs, ...legacy]));

    for (const rel of delFiles) {
      try {
        const abs = path.join(
          __dirname,
          "..",
          rel.replace(/^\/+/, "")
        );
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch {
        /* ignore */
      }
    }

    await doc.deleteOne();

    // ✅ نسجّل عملية حذف حقيقية في مكان آخر؟ هنا الحذف من الـ DB
    // لو أردت الاحتفاظ به كـ cancelled بدل حذف، يمكن تعديل المنطق لاحقاً

    res.json({ message: "تم الحذف" });
  } catch (err) {
    console.error("❌ deleteBloodRequest:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

/* ========= طلباتي + العروض ========= */
exports.getMineWithOffers = async (req, res) => {
  try {
    const myId = req.user._id;
    const requests = await BloodRequest.find({
      userId: myId,
    })
      .sort({ createdAt: -1 })
      .lean();
    const reqIds = requests.map((r) => r._id);
    const confirmations = await DonationConfirmation.find({
      requestId: { $in: reqIds },
    })
      .populate("donor", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    const grouped = confirmations.reduce((acc, c) => {
      const k = String(c.requestId);
      (acc[k] ||= []).push(c);
      return acc;
    }, {});
    res.json(
      requests.map((r) => ({
        ...r,
        offers: grouped[String(r._id)] || [],
      }))
    );
  } catch (err) {
    console.error("❌ getMineWithOffers:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

exports.getMyBloodRequests = async (req, res) => {
  try {
    const items = await BloodRequest.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("❌ getMyBloodRequests:", err);
    res.status(500).json({ message: "خطأ في السيرفر" });
  }
};


/* ========= STOP / RE-ACTIVATE ========= */
exports.stopBloodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body;

    const doc = await BloodRequest.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "طلب التبرع غير موجود" });
    }

    if (String(doc.userId) !== String(req.user?._id)) {
      return res.status(403).json({ message: "غير مصرح" });
    }

    const oldStatus = doc.status || "active";
    const willPause = oldStatus === "active";

    let newStatus;
    if (willPause) {
      newStatus = "paused";
      doc.closedReason = reason.trim();
      doc.closedAt = new Date();
      doc.closedBy = req.user._id;
    } else {
      newStatus = "active";
    }

    doc.status = newStatus;

    addHistory(doc, {
      action: willPause ? "user_stop" : "user_reactivate",
      by:req.user._id,
      user: req.user._id,
      role: "user",
      fromStatus: oldStatus,
      toStatus: newStatus,
      reason: reason.trim(),
    });

    await doc.save();

    const populated = await BloodRequest.findById(doc._id).populate({
      path: "userId",
      select: "firstName lastName profileImage",
    });

    return res.json({ data: populated });
  } catch (err) {
    console.error("❌ stopBloodRequest:", err);
    res.status(500).json({ message: "خطأ في السيرفر", error: err.message });
  }
};

