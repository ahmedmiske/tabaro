const BloodRequest = require('../models/bloodRequest');
const DonationConfirmation = require('../models/DonationConfirmation');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/user');

// @desc    Create a new blood request
// @route   POST /api/blood-requests
// @access  Private
const createBloodRequest = asyncHandler(async (req, res) => {
  const { bloodType, location, deadline, description, isUrgent, contactMethods } = req.body;

  let parsedContactMethods = [];
  if (contactMethods) {
    try {
      parsedContactMethods = typeof contactMethods === 'string' ? JSON.parse(contactMethods) : contactMethods;
    } catch (e) {
      return res.status(400).json({ message: 'Invalid contactMethods format.' });
    }
  }

  let files = [];
  if (req.files && Array.isArray(req.files)) {
    files = req.files.map(file => file.filename);
  }

  const bloodRequest = new BloodRequest({
    bloodType,
    location,
    deadline,
    description,
    isUrgent: isUrgent === 'true' || isUrgent === true,
    userId: req.user._id,
    contactMethods: parsedContactMethods,
    files,
  });

  const createdBloodRequest = await bloodRequest.save();
  res.status(201).json(createdBloodRequest);
});

// @desc    Get blood requests by status (active or inactive)
// @route   GET /api/blood-requests?status=active|inactive
// @access  Public
const getBloodRequests = asyncHandler(async (req, res) => {
  const statusFilter = req.query.status;
  const now = new Date();

  let filter = {};

  if (statusFilter === 'active') {
    filter.deadline = { $gte: now }; // نشط فقط إذا لم يصل بعد للموعد
  } else if (statusFilter === 'inactive') {
    filter.deadline = { $lt: now }; // غير نشط إذا تجاوزنا الموعد
  }

  const bloodRequests = await BloodRequest.find(filter)
    .populate('userId', 'firstName lastName')
    .sort({ deadline: 1 })
    .lean();

  // وضع علامة isActive لتأكيد الفكرة في الواجهة
  for (let req of bloodRequests) {
    req.isActive = new Date(req.deadline) >= now;
  }

  res.json(bloodRequests);
});



// @desc    Get a single blood request by ID
// @route   GET /api/blood-requests/:id
// @access  Public
const getBloodRequestById = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id).populate('userId', 'firstName lastName');

  if (bloodRequest) {
    res.json(bloodRequest);
  } else {
    res.status(404);
    throw new Error('Blood request not found');
  }
});

// @desc    Update a blood request
// @route   PUT /api/blood-requests/:id
// @access  Private
const updateBloodRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);

  if (bloodRequest) {
    if (bloodRequest.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to update this blood request');
    }

    bloodRequest.bloodType = req.body.bloodType || bloodRequest.bloodType;
    bloodRequest.location = req.body.location || bloodRequest.location;
    bloodRequest.deadline = req.body.deadline || bloodRequest.deadline;
    bloodRequest.description = req.body.description || bloodRequest.description;
    bloodRequest.isUrgent = req.body.isUrgent !== undefined ? req.body.isUrgent : bloodRequest.isUrgent;
    bloodRequest.contactMethods = req.body.contactMethods || bloodRequest.contactMethods;

    const updatedBloodRequest = await bloodRequest.save();
    res.json(updatedBloodRequest);
  } else {
    res.status(404);
    throw new Error('Blood request not found');
  }
});

// @desc    Delete a blood request
// @route   DELETE /api/blood-requests/:id
// @access  Private
const deleteBloodRequest = asyncHandler(async (req, res) => {
  const bloodRequest = await BloodRequest.findById(req.params.id);

  if (bloodRequest) {
    if (bloodRequest.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to delete this blood request');
    }

    await BloodRequest.deleteOne(bloodRequest);
    res.json({ message: 'Blood request removed' });
  } else {
    res.status(404);
    throw new Error('Blood request not found');
  }
});

// @desc    Get my requests with donation offers
// @route   GET /api/blood-requests/mine-with-offers?status=active|inactive
// @access  Private
const getMyRequestsWithOffers = asyncHandler(async (req, res) => {
  const statusFilter = req.query.status;
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  let requests = await BloodRequest.find({ userId: req.user._id })
    .populate('userId', 'firstName lastName')
    .lean();

  for (let request of requests) {
    const offers = await DonationConfirmation.find({ requestId: request._id })
      .populate('donor', 'firstName lastName')
      .lean();

    request.offers = offers;

    const deadline = new Date(request.deadline);
    request.isActive = deadline >= twoDaysAgo;
  }

  if (statusFilter === 'active') {
    requests = requests.filter(r => r.isActive);
  } else if (statusFilter === 'inactive') {
    requests = requests.filter(r => !r.isActive);
  }

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
// This controller handles blood request operations such as creating, fetching, updating, and deleting requests.
// It also includes functionality to get a user's requests along with any donation offers they have received.