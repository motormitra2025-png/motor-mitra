
const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const farmerController = require('../controllers/farmer.controller');

/**
 * @swagger
 * tags:
 *   name: Farmer
 *   description: Farmer related APIs
 */

/**
 * @swagger
 * /api/farmers/register:
 *   post:
 *     summary: Register a new farmer
 *     description: Farmer self-registration with optional agent referral ID
 *     tags: [Farmer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - father_name
 *               - mobile
 *               - pin
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Ramu
 *               father_name:
 *                 type: string
 *                 example: Shankar
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               pin:
 *                 type: string
 *                 example: "1234"
 *               aadhaar_last4:
 *                 type: string
 *                 example: "4321"
 *               village:
 *                 type: string
 *                 example: Kondapur
 *               mandal:
 *                 type: string
 *                 example: Sangareddy
 *               district:
 *                 type: string
 *                 example: Rangareddy
 *               state:
 *                 type: string
 *                 example: Telangana
 *               pincode:
 *                 type: string
 *                 example: "502001"
 *               land_area_acres:
 *                 type: number
 *                 example: 3.5
 *               passbook_last6:
 *                 type: string
 *                 example: "654321"
 *               east_boundary:
 *                 type: string
 *                 example: Ravi
 *               west_boundary:
 *                 type: string
 *                 example: Suresh
 *               north_boundary:
 *                 type: string
 *                 example: Mahesh
 *               south_boundary:
 *                 type: string
 *                 example: Ramesh
 *               referredByAgentId:
 *                 type: string
 *                 example: AGT123456789
 *     responses:
 *       201:
 *         description: Farmer registered successfully
 *       400:
 *         description: Farmer already exists
 */
router.post('/register', farmerController.registerFarmer);

/**
 * @swagger
 * /api/farmers/login:
 *   post:
 *     summary: Farmer login
 *     tags: [Farmer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - pin
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid PIN
 *       404:
 *         description: Farmer not found
 */
router.post('/login', farmerController.loginFarmer);

/**
 * @swagger
 * /api/farmers/me:
 *   get:
 *     summary: Get logged-in farmer profile
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Farmer profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect(['FARMER']), farmerController.getProfile);

/**
 * @swagger
 * /api/farmers/me:
 *   put:
 *     summary: Update farmer profile
 *     description: Update farmer profile details (PIN, mobile, farmerId cannot be updated)
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               village:
 *                 type: string
 *                 example: Kondapur
 *               mandal:
 *                 type: string
 *                 example: Sangareddy
 *               district:
 *                 type: string
 *                 example: Rangareddy
 *               pincode:
 *                 type: string
 *                 example: "502001"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', protect(['FARMER']), farmerController.updateProfile);

/**
 * @swagger
 * /api/farmers/membership:
 *   get:
 *     summary: Get farmer membership status
 *     tags: [Farmer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership status retrieved
 */
router.get(
  '/membership',
  protect(['FARMER']),
  farmerController.getMembershipStatus
);

/**
 * @swagger
 * /api/farmers/verify-reset:
 *   post:
 *     summary: Verify farmer before PIN reset
 *     tags: [Farmer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - aadhaar_last4
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               aadhaar_last4:
 *                 type: string
 *                 example: "4321"
 *     responses:
 *       200:
 *         description: Verification successful
 *       400:
 *         description: Verification failed
 */
router.post('/verify-reset', farmerController.verifyFarmerForReset);

/**
 * @swagger
 * /api/farmers/reset-pin:
 *   post:
 *     summary: Reset farmer PIN
 *     tags: [Farmer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - new_pin
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               new_pin:
 *                 type: string
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: PIN updated successfully
 *       404:
 *         description: Farmer not found
 */
router.post('/reset-pin', farmerController.resetFarmerPin);

module.exports = router;














/*const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const farmerController = require('../controllers/farmer.controller');

// Farmer registration (self / with optional Agent Refer ID)
router.post('/register', farmerController.registerFarmer);

// Farmer login (mobile + PIN)
router.post('/login', farmerController.loginFarmer);

// Farmer profile
router.get(
  '/me',
  protect(['FARMER']),
  farmerController.getProfile
);

// Update farmer profile (excluding PIN)
router.put(
  '/me',
  protect(['FARMER']),
  farmerController.updateProfile
);

// Farmer membership status
router.get(
  '/membership',
  protect(['FARMER']),
  farmerController.getMembershipStatus
);

router.post('/verify-reset', farmerController.verifyFarmerForReset);
router.post('/reset-pin', farmerController.resetFarmerPin); 

module.exports = router;*/