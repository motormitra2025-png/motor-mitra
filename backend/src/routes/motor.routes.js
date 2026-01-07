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
 *     summary: Add motor(s) for a farmer (before membership payment)
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
 *               - motors
 *             properties:
 *               motors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - motor_name
 *                     - hp
 *                     - company
 *                     - photo_url
 *                     - location
 *                   properties:
 *                     motor_name:
 *                       type: string
 *                       example: Kirloskar Pump
 *                     hp:
 *                       type: number
 *                       example: 5
 *                     company:
 *                       type: string
 *                       example: Kirloskar
 *                     photo_url:
 *                       type: string
 *                       example: https://example.com/motor.jpg
 *                     location:
 *                       type: object
 *                       properties:
 *                         lat:
 *                           type: number
 *                           example: 17.385
 *                         lng:
 *                           type: number
 *                           example: 78.4867
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