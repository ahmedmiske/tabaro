// server/controllers/bloodRequestController.js
const BloodRequest = require("../models/bloodRequest");
const DonationConfirmation = require("../models/DonationConfirmation");
const asyncHandler = require("../utils/asyncHandler");

/** يبني documents[] من أي شكل قادم من multer (fields/array) */
function collectDocumentsFromReq(req) {
  const list = [
    ...(req.files?.docs || []),
    ...(req.files?.files || []),
    ...(Array.isArray(req.files) ? req.files : []), // احتياط لو استخدمت upload.array
  ];
  return list.map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    mimeType: f.mimetype,
    size: f.size,
    url: `/uploads/blood-requests/${f.filename}`,
  }));
}

/** يحاول قراءة contactMethods سواء جاءت كسلسلة JSON أو كمصفوفة جاهزة */
function parseContactMethods(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      /* ignore */
    }
  }
  return [];
}

// @desc    Create a new blood request
// @route   POST /api/blood-requests
// @access  Private
const createBloodRequest = asyncHandler(async (req, res) => {

  if (req.fileFilterError) {
    return res.status(415).send(req.fileFilterError);
  }

  const { bloodType, location, deadline, description, isUrgent } = req.body;

  const contactMethods = parseContactMethods(req.body.contactMethods);
  const documents = collectDocumentsFromReq(req);

  const created = await BloodRequest.create({
    bloodType,
    location,
    deadline,
    description,
    isUrgent: isUrgent === "true" || isUrgent === true,
    userId: req.user._id,
    contactMethods,
    documents, // ✅ الحقل المعتمد
    files: [], // (اختياري) اتركه فارغًا للانسجام مع السجلات القديمة
  });

  res.status(201).json(created);
});

// @desc    Get blood requests (with optional status + pagination)
// @route   GET /api/blood-requests?status=active|inactive|all&page=1&limit=12
// @access  Public
const getBloodRequests = asyncHandler(async (req, res) => {
  const { status = "all" } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

  const filter = {};
  const now = new Date();
  if (status === "active") filter.deadline = { $gte: now };
  if (status === "inactive") filter.deadline = { $lt: now };

  const [items, total] = await Promise.all([
    BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-__v")
      .populate("userId", "firstName lastName profileImage"),
    BloodRequest.countDocuments(filter),
  ]);

  // (اختياري) لو تبي تضيف isActive بالحسبان
  const withFlag = items.map((d) => ({
    ...d.toObject(),
    isActive: new Date(d.deadline) >= now,
  }));

  res.json({
    items: withFlag,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

// @desc    Get a single blood request by ID
// @route   GET /api/blood-requests/:id
// @access  Public
const getBloodRequestById = asyncHandler(async (req, res) => {
  const doc = await BloodRequest.findById(req.params.id).populate(
    "userId",
    "firstName lastName profileImage",
  );

  if (!doc) {
    return res.status(404).json({ message: "Blood request not found" });
  }
  res.json(doc);
});

// @desc    Update a blood request (يمكن إضافة وثائق جديدة)
// @route   PUT /api/blood-requests/:id
// @access  Private
const updateBloodRequest = asyncHandler(async (req, res) => {
  const br = await BloodRequest.findById(req.params.id);
  if (!br) return res.status(404).json({ message: "Blood request not found" });
  if (String(br.userId) !== String(req.user._id))
    return res.status(403).json({ message: "Not authorized" });

  const { bloodType, location, deadline, description, isUrgent } = req.body;
  if (bloodType !== undefined) br.bloodType = bloodType;
  if (location !== undefined) br.location = location;
  if (deadline !== undefined) br.deadline = deadline;
  if (description !== undefined) br.description = description;
  if (isUrgent !== undefined)
    br.isUrgent = isUrgent === "true" || isUrgent === true;

  // contactMethods قد تأتي كسلسلة
  if (req.body.contactMethods !== undefined) {
    br.contactMethods = parseContactMethods(req.body.contactMethods);
  }

  // إلحاق وثائق جديدة إن رُفعت
  const newDocs = collectDocumentsFromReq(req);
  if (newDocs.length) {
    br.documents.push(...newDocs);
  }

  const updated = await br.save();
  res.json(updated);
});

// @desc    Delete a blood request
// @route   DELETE /api/blood-requests/:id
// @access  Private
const deleteBloodRequest = asyncHandler(async (req, res) => {
  const br = await BloodRequest.findById(req.params.id);
  if (!br) return res.status(404).json({ message: "Blood request not found" });
  if (String(br.userId) !== String(req.user._id))
    return res.status(403).json({ message: "Not authorized" });

  await BloodRequest.deleteOne({ _id: br._id });
  res.json({ message: "Blood request removed" });
});

// @desc    Get my requests with donation offers
// @route   GET /api/blood-requests/mine-with-offers?status=active|inactive
// @access  Private
const getMyRequestsWithOffers = asyncHandler(async (req, res) => {
  const statusFilter = req.query.status;
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  let requests = await BloodRequest.find({ userId: req.user._id })
    .populate("userId", "firstName lastName profileImage")
    .lean();

  // جمع العروض لكل طلب
  for (let request of requests) {
    const offers = await DonationConfirmation.find({ requestId: request._id })
      .populate("donor", "firstName lastName profileImage")
      .lean();
    request.offers = offers;
    request.isActive = new Date(request.deadline) >= twoDaysAgo;
  }

  if (statusFilter === "active") requests = requests.filter((r) => r.isActive);
  if (statusFilter === "inactive")
    requests = requests.filter((r) => !r.isActive);

  res.json(requests);
});

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  getMyRequestsWithOffers,
};
