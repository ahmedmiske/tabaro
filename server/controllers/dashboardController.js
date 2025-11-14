// server/controllers/dashboardController.js
const BloodRequest = require("../models/bloodRequest");
const DonationRequest = require("../models/DonationRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const DonationRequestConfirmation = require("../models/DonationRequestConfirmation");
const { SocialAd, SOCIAL_AD_STATUS } = require("../models/socialAd");

// إرجاع إحصائيات لوحة التحكم للمستخدم الحالي
exports.getDashboardStats = async (req, res, next) => {
  try {
    // نفترض أن عندك ميدلوير auth يضيف اليوزر إلى req.user
    const userId = req.user && req.user._id;

    // لو تحب الإحصائيات خاصة بالمستخدم الحالي:
    const ownerFilter = userId ? { userId } : {};

    const [
      activeBlood,
      urgentBlood,
      activeDonations,
      pendingBloodReviews,
      pendingGeneralReviews,
      myCommunityAds,
    ] = await Promise.all([
      // 1) عدد طلبات الدم (كلها تعتبر نشطة لأن السكيمة لا تحتوي status)
      BloodRequest.countDocuments(ownerFilter),

      // 2) عدد طلبات الدم المستعجلة
      BloodRequest.countDocuments({
        ...ownerFilter,
        isUrgent: true,
      }),

      // 3) عدد الطلبات العامة بحالة active
      DonationRequest.countDocuments({
        ...ownerFilter,
        status: "active",
      }),

      // 4) عروض الدم التي وصلت لحالة fulfilled (تحتاج متابعة/تقييم)
      userId
        ? DonationConfirmation.countDocuments({
            donor: userId,
            status: "fulfilled",
          })
        : 0,

      // 5) عروض التبرعات العامة التي وصلت لحالة fulfilled
      userId
        ? DonationRequestConfirmation.countDocuments({
            donor: userId,
            status: "fulfilled",
          })
        : 0,

      // 6) إعلانات المجتمع المنشورة للمستخدم (أو لجميع المستخدمين لو ما فيه user)
      userId
        ? SocialAd.countDocuments({
            authorId: userId,
            status: SOCIAL_AD_STATUS.Published,
          })
        : SocialAd.countDocuments({ status: SOCIAL_AD_STATUS.Published }),
    ]);

    const pendingReviews = pendingBloodReviews + pendingGeneralReviews;

    return res.json({
      activeBlood,
      urgentBlood,
      activeDonations,
      pendingReviews,
      communityAds: myCommunityAds,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    next(err);
  }
};
