const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Razorpay payment APIs for memberships
 */

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create Razorpay order for membership payment
 *     description: |
 *       Creates a Razorpay order based on the invoice amount.
 *       This order ID is used on the frontend to open Razorpay Checkout.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: INV123456789
 *     responses:
 *       200:
 *         description: Razorpay order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   example: order_Nx123456789
 *                 amount:
 *                   type: number
 *                   example: 6300
 *                 currency:
 *                   type: string
 *                   example: INR
 *       401:
 *         description: Unauthorized (Farmer login required)
 *       400:
 *         description: Invalid invoice or order creation failed
 */
router.post(
  '/create-order',
  protect(['FARMER']),
  paymentController.createOrder
);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment and activate membership
 *     description: |
 *       Verifies Razorpay payment signature.
 *       On successful verification:
 *       - Marks payment as SUCCESS
 *       - Marks invoice as PAID
 *       - Activates membership (start date = payment date + 15 days)
 *       - Activates linked motors
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - membershipId
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: order_Nx123456789
 *               razorpay_payment_id:
 *                 type: string
 *                 example: pay_Nx987654321
 *               razorpay_signature:
 *                 type: string
 *                 example: d34db33f0a123abc...
 *               membershipId:
 *                 type: string
 *                 example: MEM123456789
 *     responses:
 *       200:
 *         description: Payment verified and membership activated
 *       400:
 *         description: Payment verification failed
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/verify',
  protect(['FARMER']),
  paymentController.verifyPayment
);


router.get(
  '/my-payments',
  protect(['FARMER']),
  paymentController.getMyPayments
);

module.exports = router;














/*const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post(
  '/create-order',
  protect(['FARMER']),
  paymentController.createOrder
);

router.post(
  '/verify',
  protect(['FARMER']),
  paymentController.verifyPayment
);

module.exports = router;*/