const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const agentController = require('../controllers/agent.controller');

/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: Agent related APIs
 */

/**
 * @swagger
 * /api/agents/register:
 *   post:
 *     summary: Register a new agent
 *     tags: [Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - mobile
 *               - pin
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Suresh Kumar
 *               mobile:
 *                 type: string
 *                 example: "9876543211"
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
 *     responses:
 *       201:
 *         description: Agent registered successfully
 *       400:
 *         description: Agent already exists
 */
router.post('/register', agentController.registerAgent);

/**
 * @swagger
 * /api/agents/login:
 *   post:
 *     summary: Agent login
 *     tags: [Agent]
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
 *                 example: "9876543211"
 *               pin:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid PIN
 *       404:
 *         description: Agent not found
 */
router.post('/login', agentController.loginAgent);

/**
 * @swagger
 * /api/agents/me:
 *   get:
 *     summary: Get logged-in agent profile
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/me',
  protect(['AGENT']),
  agentController.getProfile
);

/**
 * @swagger
 * /api/agents/my-farmers:
 *   get:
 *     summary: Get farmers referred by agent
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of farmers referred by agent
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/my-farmers',
  protect(['AGENT']),
  agentController.getMyFarmers
);

/**
 * @swagger
 * /api/agents/verify-reset:
 *   post:
 *     summary: Verify agent before PIN reset
 *     tags: [Agent]
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
 *                 example: "9876543211"
 *               aadhaar_last4:
 *                 type: string
 *                 example: "4321"
 *     responses:
 *       200:
 *         description: Verification successful
 *       400:
 *         description: Verification failed
 */
router.post('/verify-reset', agentController.verifyReset);

/**
 * @swagger
 * /api/agents/reset-pin:
 *   post:
 *     summary: Reset agent PIN
 *     tags: [Agent]
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
 *                 example: "9876543211"
 *               new_pin:
 *                 type: string
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: PIN updated successfully
 *       404:
 *         description: Agent not found
 */
router.post('/reset-pin', agentController.resetPin);

module.exports = router;






/*const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const agentController = require('../controllers/agent.controller');

router.post('/register', agentController.registerAgent);
router.post('/login', agentController.loginAgent);

router.get(
  '/me',
  protect(['AGENT']),
  agentController.getProfile
);

router.get(
  '/my-farmers',
  protect(['AGENT']),
  agentController.getMyFarmers
);

router.post('/verify-reset', agentController.verifyReset);
router.post('/reset-pin', agentController.resetPin);

module.exports = router;*/