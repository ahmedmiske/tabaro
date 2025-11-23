// create model with this fields code name_fr name_ar is_active
const mongoose = require("mongoose");

const wilayaSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name_fr: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Speed up queries that load active wilayas for dropdowns
wilayaSchema.index({ is_active: 1, code: 1 });

const Wilaya = mongoose.model("wilaya", wilayaSchema);

module.exports = Wilaya;