const router = require('express').Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Invoice
 *   description: Invoice generation and billing APIs
 */

/**
 * @swagger
 * /api/invoices/generate:
 *   post:
 *     summary: Generate invoice for farmer membership
 *     description: |
 *       Generates an invoice before payment based on:
 *       - Number of motors
 *       - Per motor price
 *       - GST calculation
 *       - Motor details (HP, company, location, photo)
 *     tags: [Invoice]
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
 *     responses:
 *       201:
 *         description: Invoice generated successfully
 *       401:
 *         description: Unauthorized (Farmer login required)
 *       400:
 *         description: Invalid invoice data
 */
router.post(
  '/generate',
  protect(['FARMER']),
  invoiceController.generateInvoice
);

module.exports = router;






/*const router = require('express').Router();
const invoiceController = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');

router.post(
  '/generate',
  protect(['FARMER']),
  invoiceController.generateInvoice
);

module.exports = router;*/