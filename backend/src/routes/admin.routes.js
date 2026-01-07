const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminController.loginAdmin);

/**
 * @swagger
 * /api/admin/farmers:
 *   get:
 *     summary: Get all farmers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all farmers
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/farmers',
  protect(['ADMIN']),
  adminController.getAllFarmers
);

/**
 * @swagger
 * /api/admin/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all agents
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/agents',
  protect(['ADMIN']),
  adminController.getAllAgents
);

/**
 * @swagger
 * /api/admin/farmers/agent/{agentId}:
 *   get:
 *     summary: Get farmers registered under a specific agent
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         example: AGT123456
 *     responses:
 *       200:
 *         description: Farmers under the given agent
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agent not found
 */
router.get(
  '/farmers/agent/:agentId',
  protect(['ADMIN']),
  adminController.getFarmersByAgent
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics (farmers, agents, motors, memberships)
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/stats',
  protect(['ADMIN']),
  adminController.getStats
);

module.exports = router;






/*const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.post('/login', adminController.loginAdmin);

router.get(
  '/farmers',
  protect(['ADMIN']),
  adminController.getAllFarmers
);

router.get(
  '/agents',
  protect(['ADMIN']),
  adminController.getAllAgents
);

router.get(
  '/farmers/agent/:agentId',
  protect(['ADMIN']),
  adminController.getFarmersByAgent
);

router.get(
  '/stats',
  protect(['ADMIN']),
  adminController.getStats
);

module.exports = router;*/