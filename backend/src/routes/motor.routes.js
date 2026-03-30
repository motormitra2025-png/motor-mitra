const router = require('express').Router();
const motorController = require('../controllers/motor.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Motors
 *   description: Farmer motor management APIs
 */

/**
 * @swagger
 * /api/motors/add:
 *   post:
 *     summary: Add geo-tagged motor(s) for a farmer
 *     tags: [Motors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmerId
 *               - motors
 *             properties:
 *               farmerId:
 *                 type: string
 *                 example: 6809f3a8f0a12b45c8de9012
 *               motors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - motorName
 *                     - photoUrl
 *                     - latitude
 *                     - longitude
 *                     - address
 *                     - timestamp
 *                   properties:
 *                     motorName:
 *                       type: string
 *                       example: Kirloskar Pump
 *                     photoUrl:
 *                       type: string
 *                       example: https://example.com/motor.jpg
 *                     latitude:
 *                       type: number
 *                       example: 17.385
 *                     longitude:
 *                       type: number
 *                       example: 78.4867
 *                     address:
 *                       type: string
 *                       example: Kondapur, Telangana
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-03-30T10:15:00.000Z
 *     responses:
 *       201:
 *         description: Motors added successfully
 *       401:
 *         description: Unauthorized (Farmer login required)
 *       400:
 *         description: Invalid request data
 */
router.post(
  '/add',
  protect(['FARMER']),
  motorController.addMotors
);

/**
 * @swagger
 * /api/motors/{farmerId}:
 *   get:
 *     summary: Get all motors for a farmer
 *     tags: [Motors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmerId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6809f3a8f0a12b45c8de9012
 *     responses:
 *       200:
 *         description: Motors fetched successfully
 *       400:
 *         description: Invalid farmerId
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:farmerId',
  protect(['FARMER', 'AGENT', 'ADMIN']),
  motorController.getMotorsByFarmerId
);

module.exports = router;




/*const router = require('express').Router();
const motorController = require('../controllers/motor.controller');
const { protect } = require('../middleware/auth.middleware');

router.post(
  '/add',
  protect(['FARMER']),
  motorController.addMotors
);

module.exports = router;*/
