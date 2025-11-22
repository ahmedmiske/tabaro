// server/routes/searchRoute.js

const express = require("express");
const DonationRequest = require("../models/DonationRequest.js");
const BloodRequest = require("../models/bloodRequest.js"); // اسم الملف الحقيقي small b

const router = express.Router();

// GET /api/search?q=query
router.get("/", async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json([]);
    }

    // 🔎 بحث في التبرعات العامة
    // الحقول الموجودة فعلاً في DonationRequest:
    // category, type, description, place, bloodType
    const generalPromise = DonationRequest.find({
      $or: [
        { category:    { $regex: query, $options: "i" } },
        { type:        { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { place:       { $regex: query, $options: "i" } },
        { bloodType:   { $regex: query, $options: "i" } },
      ],
    }).limit(20);

    // 🔎 بحث في طلبات التبرع بالدم
    const bloodPromise = BloodRequest.find({
      $or: [
        { bloodType:   { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { city:        { $regex: query, $options: "i" } },
        { hospitalName:{ $regex: query, $options: "i" } },
        { location:    { $regex: query, $options: "i" } },
      ],
    }).limit(20);

    const [general, blood] = await Promise.all([generalPromise, bloodPromise]);

    // 🧩 توحيد النتائج في مصفوفة واحدة مع نوع العنصر
    const normalized = [
      ...general.map((g) => ({
        _id: g._id,
        title: g.category
          ? `طلب تبرع (${g.category})`
          : "طلب تبرع عام",
        description: g.description || "",
        category: g.category || "تبرع عام",
        donationType: g.type || "general",
        city: g.place || "",
        type: "general",
        bloodType: g.bloodType || "",
      })),
      ...blood.map((b) => ({
        _id: b._id,
        title: `طلب تبرع بالدم ${
          b.bloodType ? "(" + b.bloodType + ")" : ""
        }`,
        description: b.description || "",
        category: "تبرع بالدم",
        donationType: "blood",
        city: b.city || b.location || "",
        type: "blood",
        bloodType: b.bloodType || "",
      })),
    ];

    res.json(normalized);
  } catch (err) {
    console.error("Error searching:", err);
    res.status(500).json({ message: "Error searching", error: err.message });
  }
});

module.exports = router;
// End of server/routes/searchRoute.js