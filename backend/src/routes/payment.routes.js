const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/webhook', paymentController.handleWebhook);

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

router.get(
  '/verify/:paymentId',
  protect(['FARMER']),
  paymentController.verifyPaymentById
);

router.get(
  '/my-payments',
  protect(['FARMER']),
  paymentController.getMyPayments
);

module.exports = router;
