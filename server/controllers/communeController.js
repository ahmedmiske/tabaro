const Commune = require("../models/communes");
const asyncHandler = require("../utils/asyncHandler");

const getAllCommunes = asyncHandler(async (_req, res) => {
  const communes = await Commune.find({ is_active: true })
    .select("code name_fr name_ar")
    .sort({ code: 1 })
    .lean();

  res.json(communes);
});

module.exports = { getAllCommunes };
