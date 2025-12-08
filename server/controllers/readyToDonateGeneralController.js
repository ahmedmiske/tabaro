// server/controllers/readyToDonateGeneralController.js
const ReadyToDonateGeneral = require('../models/ReadyToDonateGeneral');

// ملاحظة: حذفنا هذا السطر لأنه يسبب الخطأ
// const { addHistory } = require('../models/plugins/statusPlugin');

// التحقق من رقم الهاتف (6–15 رقم)
const isPhone = (v = '') => /^[0-9]{6,15}$/.test(String(v).trim());

/**
 * إنشاء إعلان استعداد للتبرع العام
 */
exports.create = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ error: 'غير مصرح، يرجى تسجيل الدخول' });
    }

    const userId = req.user._id;

    const body = req.body || {};
    let {
      locationMode = 'none',
      location = '',
      city = '',
      country = '',
      availableUntil,
      note = '',
      extra = {},
      contactMethods,
    } = body;

    // extra قد تأتي كسلسلة JSON
    if (typeof extra === 'string') {
      try {
        extra = JSON.parse(extra);
      } catch {
        extra = {};
      }
    }

    // دعم الحقول المسطّحة extra.*
    if (
      body['extra.donationType'] ||
      body['extra.category'] ||
      body['extra.amount']
    ) {
      extra = {
        ...(extra || {}),
        donationType: body['extra.donationType'] || extra.donationType,
        category: body['extra.category'] || extra.category,
      };

      if (body['extra.amount'] != null && body['extra.amount'] !== '') {
        const amountNum = Number(body['extra.amount']);
        if (!Number.isNaN(amountNum)) {
          extra.amount = amountNum;
        }
      }
    }

    // contactMethods قد تأتي كسلسلة JSON
    if (typeof contactMethods === 'string') {
      try {
        contactMethods = JSON.parse(contactMethods);
      } catch {
        contactMethods = [];
      }
    }
    if (!Array.isArray(contactMethods)) {
      contactMethods = [];
    }

    // معالجة المرفقات (إن وجدت)
    let attachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      attachments = req.files.map((f) => ({
        url: f.path?.replace(/^public[\\/]/, '') || `/uploads/${f.filename}`,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
      }));
    }

    extra = extra || {};
    if (attachments.length > 0) {
      extra.attachments = attachments;
    }

    // التحقق من extra
    if (!extra.category) {
      return res
        .status(400)
        .json({ error: 'category is required in extra.category' });
    }

    if (!extra.donationType) {
      return res
        .status(400)
        .json({ error: 'donationType is required in extra.donationType' });
    }

    if (!['financial', 'inkind'].includes(extra.donationType)) {
      return res
        .status(400)
        .json({ error: 'donationType must be financial or inkind' });
    }

    if (extra.donationType === 'financial') {
      const amountNum = Number(extra.amount);
      if (extra.amount == null || Number.isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          error:
            'amount is required and must be a positive number for financial donations',
        });
      }
      extra.amount = amountNum;
    } else {
      // تبرع عيني → لا نحتاج قيمة amount
      delete extra.amount;
    }

    // التحقق من availableUntil
    if (!availableUntil) {
      return res
        .status(400)
        .json({ error: 'availableUntil is required' });
    }

    const untilDate = new Date(availableUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(untilDate.getTime()) || untilDate < today) {
      return res.status(400).json({
        error: 'availableUntil must be today or a future date',
      });
    }

    // التحقق من وسائل التواصل
    if (!Array.isArray(contactMethods) || contactMethods.length === 0) {
      return res
        .status(400)
        .json({ error: 'At least one contact method is required' });
    }

    for (const c of contactMethods) {
      if (!c?.method || !c?.number) {
        return res.status(400).json({ error: 'Invalid contact method' });
      }
      if (!isPhone(c.number)) {
        return res
          .status(400)
          .json({ error: 'Contact numbers must be 6–15 digits' });
      }
    }

    // إنشاء الوثيقة
    const doc = await ReadyToDonateGeneral.create({
      locationMode,
      location,
      city,
      country,
      availableUntil: untilDate,
      note,
      extra,
      contactMethods,
      createdBy: userId,
      // status & historyActions → من الـ plugin
    });

    // ✅ إضافة history يدويًا عند الإنشاء
    if (!Array.isArray(doc.historyActions)) {
      doc.historyActions = [];
    }

    doc.historyActions.push({
      action: 'create',
      by: userId,
      role: 'user',
      fromStatus: null,
      toStatus: doc.status || 'active',
      reason: undefined,
      note: 'إنشاء عرض الاستعداد للتبرع العام',
      createdAt: new Date(),
    });

    await doc.save();

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    console.error('ReadyToDonateGeneral.create', err);
    return res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};

/**
 * قائمة إعلانات الاستعداد (افتراضيًا النشطة فقط)
 */
exports.list = async (req, res) => {
  try {
    const { category, q = '', donationType, status = 'active' } = req.query || {};
    const filter = {};

    if (category) {
      filter['extra.category'] = category;
    }

    if (donationType) {
      filter['extra.donationType'] = donationType;
    }

    // افتراضيًا نعرض النشطة فقط، إلا إذا طلب status=all
    if (status && status !== 'all') {
      filter.status = status;
    }

    // لضمان عدم ظهور المنتهية لو لم يتغير status بعد
    const now = new Date();
    filter.availableUntil = { $gte: now };

    if (q) {
      filter.$text = { $search: q };
    }

    const data = await ReadyToDonateGeneral.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('createdBy', 'firstName lastName profileImage');

    return res.json({ ok: true, data });
  } catch (err) {
    console.error('ReadyToDonateGeneral.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * تفاصيل إعلان واحد
 */
exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await ReadyToDonateGeneral.findById(id).populate({
      path: 'createdBy',
      select: 'firstName lastName profileImage createdAt',
    });

    if (!doc) {
      return res
        .status(404)
        .json({ message: 'عرض الاستعداد للتبرع غير موجود' });
    }

    res.json({ data: doc });
  } catch (err) {
    console.error('❌ getOne ready-to-donate-general:', err);
    res
      .status(500)
      .json({ message: 'خطأ في جلب تفاصيل العرض', error: err.message });
  }
};

/**
 * إيقاف / إعادة تفعيل إعلان الاستعداد للتبرع
 */
exports.stopReadyToDonateGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body || {};
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'غير مصرح، يرجى تسجيل الدخول' });
    }

    const doc = await ReadyToDonateGeneral.findById(id);
    if (!doc) {
      return res
        .status(404)
        .json({ message: 'عرض الاستعداد للتبرع غير موجود' });
    }

    // فقط صاحب الإعلان يستطيع الإيقاف/التفعيل
    if (String(doc.createdBy) !== String(userId)) {
      return res
        .status(403)
        .json({ message: 'غير مسموح لك بتعديل حالة هذا العرض' });
    }

    const oldStatus = doc.status || 'active';
    const willPause = oldStatus === 'active';

    let newStatus;
    if (willPause) {
      newStatus = 'paused';
      doc.closedReason = reason.trim() || doc.closedReason || '';
      doc.closedAt = new Date();
    } else {
      newStatus = 'active';
      // يمكن مسح سبب الإيقاف إذا أحببت
      // doc.closedReason = '';
      // doc.closedAt = null;
    }

    doc.status = newStatus;

    // ✅ تسجيل الحدث في historyActions يدويًا
    if (!Array.isArray(doc.historyActions)) {
      doc.historyActions = [];
    }

    doc.historyActions.push({
      action: willPause ? 'user_stop' : 'user_reactivate',
      by: userId,
      role: 'user',
      fromStatus: oldStatus,
      toStatus: newStatus,
      reason: willPause ? reason : undefined,
      createdAt: new Date(),
    });

    await doc.save();

    const populated = await ReadyToDonateGeneral.findById(doc._id).populate(
      'createdBy',
      'firstName lastName profileImage',
    );

    return res.json({
      message: willPause
        ? 'تم إيقاف نشر العرض.'
        : 'تم إعادة تفعيل العرض.',
      data: populated,
    });
  } catch (err) {
    console.error('❌ stopReadyToDonateGeneral:', err);
    return res.status(500).json({
      message: 'خطأ أثناء تحديث حالة العرض',
      error: err.message,
    });
  }
};
