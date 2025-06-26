const BloodRequest = require('../models/bloodRequest');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new blood request
// @route   POST /api/blood-requests
// @access  Private
const createBloodRequest = asyncHandler(async (req, res) => {
  const { bloodType, location, deadline, description, isUrgent, contactMethods } = req.body;

  const bloodRequest = new BloodRequest({
    bloodType,
    location,
    deadline,
    description,
    isUrgent,
    userId: req.user._id,
    contactMethods,
  });

  const createdBloodRequest = await bloodRequest.save();
  res.status(201).json(createdBloodRequest);
});

// @desc    Get all blood requests
// @route   GET /api/blood-requests
// @access  Public
const getBloodRequests = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await BloodRequest.countDocuments();
  const bloodRequests = await BloodRequest.find()
    .populate('userId', 'firstName lastName')
    .skip(skip)
    .limit(limit);

  res.json({
    result: bloodRequests,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
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

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
};
