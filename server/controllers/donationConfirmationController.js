const DonationConfirmation = require('../models/DonationConfirmation');
const BloodRequest= require('../models/bloodRequest');
const Notification = require('../models/Notification');


// ⏺️ إنشاء عرض تبرع (من قبل المتبرع)

// ⏺️ إنشاء عرض تبرع
exports.createDonationConfirmation = async (req, res) => {
  try {
    const { requestId, message, method, proposedTime } = req.body;
    const donor = req.user._id;

    console.log('📦 البيانات المستلمة من العميل:', {
      donor,
      requestId,
      message,
      method,
      proposedTime
    });

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      console.warn('❌ الطلب غير موجود في قاعدة البيانات');
      return res.status(404).json({ message: 'طلب التبرع غير موجود' });
    }

    const recipientId = request.userId;

    console.log('🔍 التحقق من هوية المستخدم:');
    console.log('   🧍‍♂️ معرف المتبرع (من التوكن):', String(donor));
    console.log('   📌 معرف صاحب الطلب:', String(recipientId));
    console.log('   هل هو نفس الشخص؟', String(donor) === String(recipientId));

    // ✅ منع صاحب الطلب من تقديم عرض
    if (String(donor) === String(recipientId)) {
      console.warn('🚫 المستخدم يحاول التبرع لنفس طلبه');
      return res.status(400).json({ message: 'لا يمكنك إرسال عرض على طلبك الخاص.' });
    }

    // 🔍 تحقق من وجود عرض سابق غير مرفوض
    const existing = await DonationConfirmation.findOne({ donor, requestId });
    if (existing) {
      console.log('⚠️ يوجد عرض سابق:', existing.status);
    }

    if (existing && ['pending', 'accepted', 'fulfilled'].includes(existing.status)) {
      return res.status(400).json({ message: 'لديك عرض سبق وتمت معالجته لهذا الطلب.' });
    }

    // ✅ إنشاء عرض جديد
    const confirmation = await DonationConfirmation.create({
      donor,
      recipientId,
      requestId,
      message,
      method,
      status: 'pending',
      proposedTime
    });

    console.log('✅ تم إنشاء عرض التبرع:', confirmation._id);

    res.status(201).json({ message: 'تم إرسال عرض التبرع بنجاح', confirmation });

  } catch (err) {
    console.error('❌ خطأ أثناء إنشاء عرض التبرع:', err);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};


// ✅ قبول التبرع من قبل صاحب الطلب
exports.acceptDonationConfirmation = async (req, res) => {
  try {
    const confirmation = await DonationConfirmation.findById(req.params.id)
      .populate('donor')       // ← لضمان الحصول على بيانات المتبرع
      .populate('requestId');  // ← إذا كنت تستخدم بيانات الطلب

    if (!confirmation) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    if (String(confirmation.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'غير مصرح لك بقبول هذا العرض' });
    }

    confirmation.status = 'accepted';
    confirmation.acceptedAt = new Date(); // ← اختياري
    await confirmation.save();

    // ✅ تحقق من أن donor موجود، وإلا استخدم ID مباشرة
    const donorId = confirmation.donor?._id || confirmation.donor;

    // 🛎️ إنشاء إشعار
    await Notification.create({
      userId: donorId,
      title: 'تم قبول عرضك للتبرع',
      message: `قام ${req.user.firstName} بقبول عرضك لطلب التبرع.`,
      read: false
    });

    res.status(200).json({ message: 'تم قبول العرض وتم إرسال إشعار للمتبرع' });

  } catch (err) {
    console.error('❌ خطأ في قبول العرض:', err);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};





// ✅ تأكيد أن التبرع تم (من أحد الطرفين)
exports.markAsFulfilled = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await DonationConfirmation.findById(id);
    if (!confirmation) return res.status(404).json({ message: 'لا يوجد سجل للتبرع' });

    confirmation.status = 'fulfilled';
    confirmation.fulfilledAt = new Date();
    await confirmation.save();

    res.status(200).json({ message: 'تم تأكيد التبرع كمنفذ', confirmation });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء التحديث', error: err.message });
  }
};

// جلب العروض المرسلة إلي المستخدم الحالي (صاحب الطلب)
exports.getMyDonationOffers = async (req, res) => {
  try {
    const myOffers = await DonationConfirmation.find({ recipientId: req.user._id })
      .populate('donor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json(myOffers);
  } catch (error) {
    console.error('Error fetching donation offers:', error);
    res.status(500).json({ message: 'فشل في جلب إشعارات التبرع' });
  }
};

// ✅ العروض التي أرسلها المستخدم كمُتبرع
const User = require('../models/user'); // تأكد من اسم الملف عندك

// 📤 العروض التي أرسلها المستخدم كمُتبرع
exports.getMySentOffers = async (req, res) => {
  try {
    const donorId = req.user._id;

    const offers = await DonationConfirmation.find({ donor: donorId })
      .populate({
        path: 'requestId',
        model: 'BloodRequest', // ✅ الاسم المسجل في mongoose.model()
        populate: {
          path: 'userId',
          model: 'User',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 });

    const formatted = offers.map((offer) => ({
      _id: offer._id,
      message: offer.message,
      method: offer.method,
      status: offer.status,
      createdAt: offer.createdAt,
      requestId: offer.requestId?._id,
      request: offer.requestId
        ? {
            bloodType: offer.requestId.bloodType,
            deadline: offer.requestId.deadline,
            user: offer.requestId.userId
          }
        : null
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ خطأ في getMySentOffers:', err.message);
    res.status(500).json({ message: 'فشل في جلب عروضك المرسلة' });
  }
};




// ⭐ إرسال التقييم بعد التبرع
exports.rateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user._id;

    const confirmation = await DonationConfirmation.findById(id);
    if (!confirmation) return res.status(404).json({ message: 'لا يوجد سجل للتبرع' });

    if (String(userId) === String(confirmation.donor)) {
      confirmation.ratingByDonor = rating;
    } else {
      confirmation.ratingByRecipient = rating;
    }

    confirmation.status = 'rated';
    await confirmation.save();

    res.status(200).json({ message: 'تم حفظ التقييم', confirmation });
  } catch (err) {
    res.status(500).json({ message: 'خطأ أثناء التقييم', error: err.message });
  }
};

// 📥 جلب جميع العروض المقدمة على طلب معين
exports.getOffersByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;

    const offers = await DonationConfirmation.find({ requestId })
      .populate('donor', 'firstName lastName email phoneNumber') // يمكنك تعديل الحقول المعروضة حسب الحاجة
      .sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (err) {
    console.error('❌ خطأ في جلب عروض التبرع للطلب:', err.message);
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ❌ رفض عرض التبرع من طرف صاحب الطلب
exports.rejectDonationConfirmation = async (req, res) => {
  try {
    const confirmation = await DonationConfirmation.findById(req.params.id);

    if (!confirmation) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    if (String(confirmation.recipientId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'غير مصرح لك برفض هذا العرض' });
    }

    if (confirmation.status !== 'pending') {
      return res.status(400).json({ message: 'لا يمكن رفض عرض تم معالجته بالفعل' });
    }

    confirmation.status = 'rejected';
    await confirmation.save();

    res.status(200).json({ message: 'تم رفض العرض بنجاح' });
  } catch (err) {
    console.error('❌ خطأ في رفض العرض:', err.message);
    res.status(500).json({ message: 'حدث خطأ أثناء الرفض', error: err.message });
  }
};

// ❌ إلغاء التبرع
// ❌ إلغاء التبرع (إذا لم يتم قبوله بعد)
exports.cancelDonationConfirmation = async (req, res) => {
  try {
    const { id } = req.params;
    const confirmation = await DonationConfirmation.findById(id);

    if (!confirmation) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    if (String(confirmation.donor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'غير مصرح لك بإلغاء هذا العرض' });
    }

    if (confirmation.status !== 'pending') {
      return res.status(400).json({ message: 'لا يمكن إلغاء العرض بعد قبوله أو تنفيذه' });
    }

    await confirmation.deleteOne();

    res.status(200).json({ message: '✅ تم إلغاء العرض بنجاح' });
  } catch (err) {
    console.error('❌ خطأ أثناء إلغاء العرض:', err.message);
    res.status(500).json({ message: 'حدث خطأ أثناء الإلغاء', error: err.message });
  }
};
// ✅ جلب جميع العروض التي أرسلها المستخدم

