const { SocialAd, SOCIAL_AD_STATUS, REPORT_REASON } = require('../models/socialAd');

// Helpers
const computeExpiresAt = (publishedAt, durationDays = 30) => {
  if (!publishedAt) return null;
  const d = new Date(publishedAt);
  d.setDate(d.getDate() + durationDays);
  return d;
};

const canEdit = (user, ad) => {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'moderator') return true;
  return String(ad.authorId) === String(user.id || user._id);
};

const buildListQuery = ({ category, wilaya, city, q, status }) => {
  const f = {};
  if (category) f.category = category;
  if (status) f.status = status;
  if (wilaya) f['location.wilaya'] = wilaya;
  if (city) f['location.city'] = city;
  if (q && q.trim()) f.$text = { $search: q.trim() };
  return f;
};

const safeJson = (v) => {
  if (v == null) return undefined;
  if (typeof v === 'object') return v;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
};

// ============ Controllers ============

// GET /api/social-ads
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = buildListQuery(req.query);
    const cursor = SocialAd.find(filter).skip(skip).limit(limit);

    if (filter.$text) {
      cursor.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
    } else {
      cursor.sort({ createdAt: -1 });
    }

    const [items, total] = await Promise.all([cursor.lean(), SocialAd.countDocuments(filter)]);
    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
};

// GET /api/social-ads/:id
exports.getOne = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id).lean();
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// POST /api/social-ads  (يدعم multipart/form-data)
exports.create = async (req, res, next) => {
  try {
    // بعض الحقول قد تصل كسلاسل JSON من FormData
    const category = req.body.category;
    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const durationDays = Number(req.body.durationDays) || 30;

    const locationInput = safeJson(req.body.location) || req.body.location || {};
    const extraFieldsInput = safeJson(req.body.extraFields) || {};

    const location = {
      wilaya: (locationInput?.wilaya || '').trim(),
      city: (locationInput?.city || '').trim(),
      district: (locationInput?.district || '').trim() || undefined,
    };

    if (!category || !title || !description || !location.wilaya || !location.city) {
      return res
        .status(400)
        .json({ message: 'يرجى تعبئة الحقول الإلزامية: النوع، العنوان، الوصف، الولاية، المدينة.' });
    }
    if (description.length < 30) {
      return res.status(400).json({ message: 'الوصف يجب ألا يقل عن 30 حرفًا.' });
    }

    // المرفقات من multer
    const attachments = Array.isArray(req.files)
      ? req.files.map((f) => ({
          url: f.path?.replace(/\\/g, '/') || f.location || `/uploads/${f.filename}`,
          name: f.originalname || f.filename,
          type: f.mimetype,
          size: f.size,
        }))
      : [];

    const now = new Date();
    const expiresAt = computeExpiresAt(now, durationDays);

    const ad = await SocialAd.create({
      category,
      title,
      description,
      location,
      durationDays,
      extraFields: extraFieldsInput,
      attachments,
      authorId: req.user.id || req.user._id,

      // النشر الفوري
      status: SOCIAL_AD_STATUS.Published,
      publishedAt: now,
      expiresAt,
    });

    res.status(201).json(ad);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/social-ads/:id
exports.update = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    if (!canEdit(req.user, ad)) return res.status(403).json({ message: 'غير مسموح بتعديل هذا الإعلان.' });
    if ([SOCIAL_AD_STATUS.Archived, SOCIAL_AD_STATUS.Rejected].includes(ad.status)) {
      return res.status(400).json({ message: 'لا يمكن تعديل إعلان مرفوض أو مؤرشف.' });
    }

    const patch = req.body || {};

    if (patch.title !== undefined) ad.title = String(patch.title || '').trim();

    if (patch.description !== undefined) {
      const d = String(patch.description || '').trim();
      if (d && d.length < 30) {
        return res.status(400).json({ message: 'الوصف يجب ألا يقل عن 30 حرفًا.' });
      }
      ad.description = d || ad.description;
    }

    if (patch.location) {
      ad.location.wilaya = patch.location.wilaya ?? ad.location.wilaya;
      ad.location.city = patch.location.city ?? ad.location.city;
      ad.location.district = patch.location.district ?? ad.location.district;
    }

    if (patch.imageUrl !== undefined) ad.imageUrl = patch.imageUrl || undefined;
    if (patch.durationDays !== undefined) ad.durationDays = Number(patch.durationDays) || ad.durationDays;
    if (patch.extraFields) ad.extraFields = patch.extraFields;

    await ad.save();
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/social-ads/:id/publish
exports.publish = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    ad.status = SOCIAL_AD_STATUS.Published;
    ad.publishedAt = new Date();
    ad.expiresAt = computeExpiresAt(ad.publishedAt, ad.durationDays);
    await ad.save();
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/social-ads/:id/reject
exports.reject = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    ad.status = SOCIAL_AD_STATUS.Rejected;
    ad.publishedAt = undefined;
    ad.expiresAt = undefined;
    await ad.save();
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// PATCH /api/social-ads/:id/archive
exports.archive = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    if (!canEdit(req.user, ad)) return res.status(403).json({ message: 'غير مسموح بأرشفة هذا الإعلان.' });
    ad.status = SOCIAL_AD_STATUS.Archived;
    ad.archivedAt = new Date();
    await ad.save();
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// POST /api/social-ads/:id/renew
exports.renew = async (req, res, next) => {
  try {
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });
    if (!canEdit(req.user, ad)) return res.status(403).json({ message: 'غير مسموح بتجديد هذا الإعلان.' });
    if (![SOCIAL_AD_STATUS.Published, SOCIAL_AD_STATUS.Expired].includes(ad.status)) {
      return res.status(400).json({ message: 'يمكن تجديد الإعلانات المنشورة أو المنتهية فقط.' });
    }
    ad.publishedAt = new Date();
    ad.expiresAt = computeExpiresAt(ad.publishedAt, ad.durationDays);
    ad.status = SOCIAL_AD_STATUS.Published;
    await ad.save();
    res.json(ad);
  } catch (e) {
    next(e);
  }
};

// POST /api/social-ads/:id/report
exports.report = async (req, res, next) => {
  try {
    const { reason, comment } = req.body || {};
    if (!Object.values(REPORT_REASON).includes(reason)) {
      return res.status(400).json({ message: 'سبب الإبلاغ غير صالح.' });
    }
    const ad = await SocialAd.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'الإعلان غير موجود.' });

    ad.reports.push({
      reporterId: req.user.id || req.user._id,
      reason,
      comment: comment ? String(comment).slice(0, 2000) : undefined,
    });

    await ad.save();
    res.status(201).json({ message: 'تم إرسال البلاغ. شكرًا لتعاونك.' });
  } catch (e) {
    next(e);
  }
};

// POST /api/social-ads/:id/conversations (MVP: يُرجع معرفًا فقط)
exports.startConversation = async (req, res, _next) => {
  res.status(201).json({ id: `conv-${req.params.id}-${Date.now()}` });
};
