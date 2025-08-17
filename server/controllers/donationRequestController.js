const DonationRequest = require('../models/DonationRequest');

// ===== أدوات مساعدة =====
const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';
const toNum  = (v) =>
  (v === '' || v === null || v === undefined ? null : Number(v));
const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// contactMethods[0][method] => [{method, number}, ...]
function parseBracketArray(body, root, fields) {
  const re = new RegExp(`^${root}\\[(\\d+)\\]\\[(${fields.join('|')})\\]$`);
  const map = new Map(); // index => obj
  for (const [key, val] of Object.entries(body)) {
    const m = key.match(re);
    if (!m) continue;
    const idx = Number(m[1]);
    const f   = m[2];
    const obj = map.get(idx) || {};
    obj[f] = val;
    map.set(idx, obj);
  }
  // فلترة العناصر الفارغة أو التي لا تحتوي أي قيمة مفيدة
  return Array.from(map.keys())
    .sort((a,b)=>a-b)
    .map(k => map.get(k))
    .filter(o => Object.values(o).some(v => String(v || '').trim() !== ''));
}

// استخراج مسارات الملفات من multer بأي شكل
function extractFiles(req) {
  // upload.fields([{ name: 'files' }])
  if (req.files?.files) return req.files.files.map(f => `/uploads/donationRequests/${f.filename}`);
  // upload.array('files')
  if (Array.isArray(req.files)) return req.files.map(f => `/uploads/donationRequests/${f.filename}`);
  // upload.single('files')
  if (req.file) return [`/uploads/donationRequests/${req.file.filename}`];
  return [];
}

// الحقول التي نُظهرها من المستخدم (الناشر)
const PUBLISHER_SELECT = 'firstName lastName profileImage createdAt';

// ===== إنشاء =====
exports.createDonationRequest = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId || null;
    if (!userId) return res.status(401).json({ message: 'غير مصرح. سجل الدخول.' });

    const { category, type, description, place, deadline, isUrgent, amount, bloodType } = req.body;

    if (!category || !type) {
      return res.status(400).json({ message: 'الرجاء تحديد المجال والنوع.' });
    }
    if (!place) {
      return res.status(400).json({ message: 'الرجاء تحديد الموقع (اسم المكان).' });
    }

    const contactMethods = parseBracketArray(req.body, 'contactMethods', ['method', 'number']);
    const paymentMethods = parseBracketArray(req.body, 'paymentMethods', ['method', 'phone']);
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
      bloodType: bloodType || '',
      contactMethods,
      paymentMethods,
      proofDocuments,
      date: new Date()
    });

    // أعِد المستند مُعبّأً مباشرةً
    const populated = await DonationRequest.findById(doc._id)
      .populate({ path: 'userId', select: PUBLISHER_SELECT });

    res.status(201).json({ message: 'تم إنشاء طلب التبرع بنجاح', data: populated });
  } catch (error) {
    console.error('❌ Create DonationRequest:', error);
    res.status(500).json({ message: 'فشل إنشاء طلب التبرع', error: error.message });
  }
};

// ===== قائمة مع فلترة وترقيم =====
exports.listDonationRequests = async (req, res) => {
  try {
    const { mine, category, type, place, urgent, page = 1, limit = 10 } = req.query;

    const q = {};
    if (mine && req.user?._id) q.userId = req.user._id;
    if (category) q.category = category;
    if (type) q.type = type;
    if (place) q.place = place;
    if (urgent === '1') q.isUrgent = true;

    const _page  = Math.max(1, Number(page) || 1);
    const _limit = Math.max(1, Number(limit) || 10);
    const skip   = (_page - 1) * _limit;

    const [items, total] = await Promise.all([
      DonationRequest.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_limit)
        .populate({ path: 'userId', select: PUBLISHER_SELECT }), // 👈 populate خفيف
      DonationRequest.countDocuments(q)
    ]);

    res.json({
      data: items,
      pagination: {
        page: _page,
        limit: _limit,
        total,
        pages: Math.ceil(total / _limit),
      }
    });
  } catch (error) {
    console.error('❌ List DonationRequests:', error);
    res.status(500).json({ message: 'فشل جلب الطلبات', error: error.message });
  }
};

// ===== واحد (تفاصيل) =====
exports.getDonationRequest = async (req, res) => {
  try {
    const doc = await DonationRequest.findById(req.params.id)
      .populate({ path: 'userId', select: PUBLISHER_SELECT }); // 👈 مهم للواجهة

    if (!doc) return res.status(404).json({ message: 'طلب التبرع غير موجود' });

    res.json({ data: doc });
  } catch (error) {
    console.error('❌ Get DonationRequest:', error);
    res.status(500).json({ message: 'فشل جلب الطلب', error: error.message });
  }
};

// ===== تحديث =====
exports.updateDonationRequest = async (req, res) => {
  try {
    const data = {};
    const fields = ['category','type','description','place','deadline','isUrgent','amount','bloodType'];
    for (const f of fields) if (f in req.body) data[f] = req.body[f];

    // تحويل الأنواع
    if ('amount'   in data) data.amount   = toNum(data.amount);
    if ('deadline' in data) data.deadline = toDate(data.deadline);
    if ('isUrgent' in data) data.isUrgent = toBool(data.isUrgent);
    if ('place'    in data) data.place    = String(data.place || '').trim();

    // مصفوفات بالأقواس
    const contactMethods = parseBracketArray(req.body, 'contactMethods', ['method','number']);
    const paymentMethods = parseBracketArray(req.body, 'paymentMethods', ['method','phone']);
    if (contactMethods.length) data.contactMethods = contactMethods;
    if (paymentMethods.length) data.paymentMethods = paymentMethods;

    // ملفات جديدة؟ ندمج مع القديمة
    const newFiles = extractFiles(req);
    if (newFiles.length) {
      const current = await DonationRequest.findById(req.params.id).select('proofDocuments');
      data.proofDocuments = [...(current?.proofDocuments || []), ...newFiles];
    }

    const updated = await DonationRequest.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate({ path: 'userId', select: PUBLISHER_SELECT });
    if (!updated) return res.status(404).json({ message: 'طلب التبرع غير موجود' });

    res.json({ message: 'تم تعديل الطلب بنجاح', data: updated });
  } catch (error) {
    console.error('❌ Update DonationRequest:', error);
    res.status(500).json({ message: 'فشل تعديل الطلب', error: error.message });
  }
};

// ===== حذف =====
exports.deleteDonationRequest = async (req, res) => {
  try {
    const request = await DonationRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'طلب التبرع غير موجود' });
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('❌ Delete DonationRequest:', error);
    res.status(500).json({ message: 'فشل حذف الطلب', error: error.message });
  }
};
