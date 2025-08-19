// server/controllers/donationRequestConfirmationController.js
const DonationRequestConfirmation = require('../models/DonationRequestConfirmation');
const DonationRequest = require('../models/DonationRequest');
const { notifyUser } = require('../utils/notify');

exports.createConfirmation = async (req, res) => {
  try {
    const donorId = req.user?._id || req.user?.id;
    if (!donorId) return res.status(401).json({ message: 'غير مصرح' });

    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId مطلوب' });

    // 👇 منع “تبرّع ثانٍ” لنفس الطلب من نفس المتبرع (إلا إذا كانت مرفوضة)
    const already = await DonationRequestConfirmation.findOne({
      requestId,
      donor: donorId,
      status: { $ne: 'rejected' },
    }).lean();
    if (already) {
      return res.status(409).json({ message: 'لديك تأكيد سابق لهذا الطلب.' });
    }

    // مسارات الملفات (multer)
    const files = [];
    if (req.files?.files) {
      for (const f of req.files.files) files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (Array.isArray(req.files)) {
      for (const f of req.files) files.push(`/uploads/donationRequestConfirmations/${f.filename}`);
    } else if (req.file) {
      files.push(`/uploads/donationRequestConfirmations/${req.file.filename}`);
    }

    const doc = await DonationRequestConfirmation.create({
      donor: donorId,
      requestId,
      message: (req.body.message || '').trim(),
      amount: req.body.amount ? Number(req.body.amount) : undefined,
      method: req.body.method || 'call',
      proposedTime: req.body.proposedTime ? new Date(req.body.proposedTime) : new Date(),
      evidence: files,                       // حفظ مسارات الإثبات
      status: 'pending_verification',        // حسب منطقك
      reminderDueAt: new Date(Date.now() + 48 * 3600 * 1000), // للتذكير بعد 48 ساعة
      overdue: false,
    });

    // إشعار صاحب الطلب (كما كان لديك)
    const request = await DonationRequest.findById(requestId).select('userId category type');
    if (request?.userId) {
      await notifyUser({
        app: req.app,
        userId: request.userId,
        sender: donorId,
        title: 'تأكيد تبرع جديد',
        message: (req.body.message && req.body.message.trim())
          ? req.body.message.trim()
          : `تلقّيت تأكيد تبرع لطلبك ${request?.category || ''}${request?.type ? ` (${request.type})` : ''}`,
        type: 'donation_request_confirmation',
        referenceId: doc._id,
      });
    }

    // ✅ إشعار المتبرّع نفسه بعد الإرسال (المطلوب)
    await notifyUser({
      app: req.app,
      userId: donorId,
      sender: donorId,
      title: 'تم إرسال تأكيدك',
      message: 'لقد تم إشعار صاحب الطلب بتبرعكم ويمكنكم الآن التواصل عبر الوسائل المتاحة.',
      type: 'info',
      referenceId: doc._id,
    });

    return res.status(201).json({ message: 'تم إنشاء التأكيد', data: doc });
  } catch (e) {
    console.error('createConfirmation error:', e);
    return res.status(500).json({ message: 'فشل إنشاء التأكيد' });
  }
};

exports.listByRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await DonationRequestConfirmation.find({ requestId: id })
      .populate('donor', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });
    return res.json({ data: list });
  } catch (e) {
    console.error('listByRequest error:', e);
    return res.status(500).json({ message: 'فشل الجلب' });
  }
};
