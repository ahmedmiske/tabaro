const mongoose = require("mongoose");

const moughataaSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name_fr: { type: String, required: true, trim: true },
    name_ar: { type: String, required: true, trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Speed up queries that load active wilayas for dropdowns
moughataaSchema.index({ is_active: 1, code: 1 });

const Moughataa = mongoose.model("moughataa", moughataaSchema);

module.exports = Moughataa;