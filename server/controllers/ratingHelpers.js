// server/controllers/ratingHelpers.js
const mongoose = require("mongoose");
const DonationConfirmation = require("../models/DonationConfirmation");
const User = require("../models/user");

const { Types } = mongoose;

/**
 * تحديث تقييم المستخدم كـ صاحب طلب (يُقَيَّم من المتبرعين)
 * نعتمد على ratingByDonor حيث recipientId = userId.
 */
async function updateUserRatingAsRecipient(userId) {
  const userObjectId = new Types.ObjectId(userId);

  const stats = await DonationConfirmation.aggregate([
    {
      $match: {
        recipientId: userObjectId,
        ratingByDonor: { $gte: 1 },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$ratingByDonor" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!stats.length) {
    await User.findByIdAndUpdate(userId, {
      "ratingAsRecipient.avg": 0,
      "ratingAsRecipient.count": 0,
    });
    return;
  }

  await User.findByIdAndUpdate(userId, {
    "ratingAsRecipient.avg": stats[0].avg,
    "ratingAsRecipient.count": stats[0].count,
  });
}

/**
 * تحديث تقييم المستخدم كـ متبرع (يُقَيَّم من أصحاب الطلبات)
 * نعتمد على ratingByRecipient حيث donor = userId.
 */
async function updateUserRatingAsDonor(userId) {
  const userObjectId = new Types.ObjectId(userId);

  const stats = await DonationConfirmation.aggregate([
    {
      $match: {
        donor: userObjectId,
        ratingByRecipient: { $gte: 1 },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$ratingByRecipient" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!stats.length) {
    await User.findByIdAndUpdate(userId, {
      "ratingAsDonor.avg": 0,
      "ratingAsDonor.count": 0,
    });
    return;
  }

  await User.findByIdAndUpdate(userId, {
    "ratingAsDonor.avg": stats[0].avg,
    "ratingAsDonor.count": stats[0].count,
  });
}

module.exports = {
  updateUserRatingAsRecipient,
  updateUserRatingAsDonor,
};
