const express = require('express');
const {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
} = require('../controllers/bloodRequestController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/multipartParser');

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: BloodRequests
 *  description: API for managing blood requests
 */

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
 *         application/json:
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
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                     number:
 *                       type: string
 *     responses:
 *       201:
 *         description: Blood request created successfully
 */
router.route('/')
  .get(protect, getBloodRequests)
  .post(
    protect,
    upload.array('files', 5), // Accept up to 5 files with field name 'files'
    createBloodRequest
  );

/**
 * @swagger
 * /blood-requests/{id}:
 *   get:
 *     summary: Get a blood request by ID
 *     tags: [BloodRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blood request ID
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
 *         description: The blood request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                     number:
 *                       type: string
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
 *         description: The blood request ID
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
