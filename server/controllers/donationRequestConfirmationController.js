const mongoose = require('mongoose');
const DonationRequestConfirmation = require('../models/DonationRequestConfirmation');
const DonationRequest = require('../models/DonationRequest');
const { notifyUser } = require('../utils/notify');

exports.createConfirmation = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }
    const donorId = req.user._id;

    const { requestId, message, amount, method, proposedTime } = req.body || {};
    if (!requestId) return res.status(400).json({ success: false, message: 'requestId مفقود' });
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: 'requestId غير صالح' });
    }

    const requestDoc = await DonationRequest.findById(requestId).select('userId category type');
    if (!requestDoc) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    const confirmation = await DonationRequestConfirmation.create({
      requestId,
      donor: donorId,
      message,
      amount: Number(amount) || 0,
      method: method || 'call',
      proposedTime: proposedTime ? new Date(proposedTime) : undefined,
      status: 'pending',
    });

    // إشعار موحّد (قاعدة + Socket) مع منع تكرار قريب
    await notifyUser({
      app: req.app,
      userId: requestDoc.userId,
      sender: donorId,
      title: 'تأكيد تبرع جديد',
      message: message || `قام ${req.user?.firstName || 'متبرّع'} بتأكيد تبرع لطلبك`,
      type: 'donation_request_confirmation',
      referenceId: confirmation._id,
    });

    res.status(201).json({ success: true, data: confirmation });
  } catch (err) {
    console.error('createConfirmation error:', err);
    res.status(500).json({ success: false, message: 'فشل إنشاء تأكيد التبرع' });
  }
};

exports.listByRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'id غير صالح' });
    }
    const rows = await DonationRequestConfirmation
      .find({ requestId: id })
      .populate('donor', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('listByRequest error:', err);
    res.status(500).json({ success: false, message: 'فشل جلب التأكيدات' });
  }
};
