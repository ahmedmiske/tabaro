const ReadyToDonateGeneral = require('../models/ReadyToDonateGeneral');

const isPhone = (v = '') => /^[0-9]{6,15}$/.test(String(v).trim());

exports.create = async (req, res) => {
  try {
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

    // في حالة multipart/form-data قد يأتي extra كـ JSON string
    if (typeof extra === 'string') {
      try {
        extra = JSON.parse(extra);
      } catch {
        extra = {};
      }
    }

    // دعم مفاتيح منفصلة مثل extra.donationType, extra.category, extra.amount
    if (body['extra.donationType'] || body['extra.category'] || body['extra.amount']) {
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

    // وسائل التواصل: قد تأتي كـ JSON string في multipart
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

    // المرفقات من req.files (حسب إعداد multer في الراوت)
    let attachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      attachments = req.files.map((f) => ({
        url:
          f.path?.replace(/^public[\\/]/, '') ||
          `/uploads/${f.filename}`,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
      }));
    }

    extra = extra || {};

    if (attachments.length > 0) {
      extra.attachments = attachments;
    }

    // ======= الفاليديشن =======

    // نوع المجال
    if (!extra.category) {
      return res
        .status(400)
        .json({ error: 'category is required in extra.category' });
    }

    // نوع التبرع (مادي / عيني)
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

    // في حالة التبرع المالي يجب تحديد مبلغ صالح
    if (extra.donationType === 'financial') {
      const amountNum = Number(extra.amount);
      if (
        extra.amount == null ||
        Number.isNaN(amountNum) ||
        amountNum <= 0
      ) {
        return res.status(400).json({
          error: 'amount is required and must be a positive number for financial donations',
        });
      }
      extra.amount = amountNum;
    } else {
      // في التبرع العيني لسنا بحاجة إلى مبلغ
      delete extra.amount;
    }

    // تاريخ انتهاء العرض
    if (!availableUntil) {
      return res.status(400).json({ error: 'availableUntil is required' });
    }
    const untilDate = new Date(availableUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(untilDate.getTime()) || untilDate < today) {
      return res
        .status(400)
        .json({ error: 'availableUntil must be today or a future date' });
    }

    // وسائل التواصل: يجب أن يكون هناك واحد على الأقل صالح
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

    const doc = await ReadyToDonateGeneral.create({
      locationMode,
      location,
      city,
      country,
      availableUntil: untilDate,
      note,
      extra,
      contactMethods,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateGeneral.create', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const { category, q = '', donationType } = req.query || {};
    const filter = {};

    if (category) {
      filter['extra.category'] = category;
    }

    if (donationType) {
      filter['extra.donationType'] = donationType;
    }

    // إظهار العروض التي لم تنتهِ بعد فقط
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
    // eslint-disable-next-line no-console
    console.error('ReadyToDonateGeneral.list', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ===== عرض واحد بالتفصيل =====
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
