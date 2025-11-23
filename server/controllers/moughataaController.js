const Moughataa = require("../models/moughataas");
const asyncHandler = require("../utils/asyncHandler");

const getAllMoughataas = asyncHandler(async (_req, res) => {
  const moughataas = await Moughataa.find({ is_active: true })
    .select("code name_fr name_ar")
    .sort({ code: 1 })
    .lean();

  res.json(moughataas);
});

module.exports = { getAllMoughataas };
