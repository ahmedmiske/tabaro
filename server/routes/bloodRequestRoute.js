const express = require('express');
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  getMyRequestsWithOffers,
} = require('../controllers/bloodRequestController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/multipartParser');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: BloodRequests
 *   description: API for managing blood requests
 */

/**
 * @swagger
 * /blood-requests/mine-with-offers:
 *   get:
 *     summary: Get my blood requests with received offers
 *     security:
 *       - bearerAuth: []
 *     tags: [BloodRequests]
 *     responses:
 *       200:
 *         description: A list of my blood requests with offers
 *       401:
 *         description: Unauthorized
 */
router.get('/mine-with-offers', protect, getMyRequestsWithOffers);

/**
 * @swagger
 * /blood-requests:
 *   get:
 *     summary: Get all blood requests
 *     tags: [BloodRequests]
 *     responses:
 *       200:
 *         description: A list of blood requests
 *   post:
 *     summary: Create a new blood request
 *     security:
 *       - bearerAuth: []
 *     tags: [BloodRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bloodType:
 *                 type: string
 *               location:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               isUrgent:
 *                 type: boolean
 *               contactMethods:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Blood request created successfully
 */
router.route('/')
  .get(getBloodRequests)
  .post(protect, upload.array('files', 5), createBloodRequest);

/**
 * @swagger
 * /blood-requests/{id}:
 *   get:
 *     summary: Get a blood request by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [BloodRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blood request details
 *       404:
 *         description: Blood request not found
 *   put:
 *     summary: Update a blood request
 *     security:
 *       - bearerAuth: []
 *     tags: [BloodRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blood request updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Blood request not found
 *   delete:
 *     summary: Delete a blood request
 *     security:
 *       - bearerAuth: []
 *     tags: [BloodRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blood request deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Blood request not found
 */
router.route('/:id')
  .get(protect, getBloodRequestById)
  .put(protect, updateBloodRequest)
  .delete(protect, deleteBloodRequest);

module.exports = router;
// This route handles all operations related to blood requests, including creating, retrieving, updating, and deleting requests.
// It also includes functionality to fetch a user's own requests along with any donation offers made against them