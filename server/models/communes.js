const mongoose = require("mongoose");

const communeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name_fr: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Speed up queries that load active wilayas for dropdowns
communeSchema.index({ is_active: 1, code: 1 });

const Commune = mongoose.model("commune", communeSchema);

module.exports = Commune;