const Wilaya = require("../models/wilayas");
const asyncHandler = require("../utils/asyncHandler");

const getAllWilayas = asyncHandler(async (_req, res) => {
  const wilayas = await Wilaya.find({ is_active: true })
    .select("code name_fr name_ar")
    .sort({ code: 1 })
    .lean();

  res.json(wilayas);
});

module.exports = { getAllWilayas };
