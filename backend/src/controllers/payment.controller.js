const crypto = require('crypto');
const razorpay = require('../utils/razorpay');

const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const Motor = require('../models/Motor');
const Invoice = require('../models/Invoice');
const Farmer = require('../models/Farmer');

const WEBHOOK_EVENTS = {
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed'
};

const verifyWebhookSignature = (rawBody, signature) => {
  if (!rawBody || !signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const receivedBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const activatePaymentSideEffects = async (payment) => {
  const invoice = await Invoice.findById(payment.invoiceId);
  if (!invoice) {
    throw new Error('Invoice not found for payment');
  }

  if (invoice.status !== 'PAID') {
    invoice.status = 'PAID';
    await invoice.save();
  }

  const membership = await Membership.findById(invoice.membershipId);
  if (!membership) {
    throw new Error('Membership not found for payment');
  }

  if (membership.status !== 'ACTIVE') {
    const startDate = membership.startDate || new Date();
    if (!membership.startDate) {
      startDate.setDate(startDate.getDate() + 15);
    }

    const expiryDate = membership.expiryDate || new Date(startDate);
    if (!membership.expiryDate) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    membership.status = 'ACTIVE';
    membership.startDate = startDate;
    membership.expiryDate = expiryDate;
  }

  if (!membership.paymentId) {
    membership.paymentId = payment._id;
  }

  await membership.save();

  await Farmer.findByIdAndUpdate(
    membership.farmerId,
    {
      membership: {
        isActive: true,
        startDate: membership.startDate,
        expiryDate: membership.expiryDate,
        motorCount: membership.motorCount
      }
    },
    { new: true }
  );

  await Motor.updateMany(
    { _id: { $in: invoice.motorIds } },
    { status: 'ACTIVE', linkedMembershipId: membership._id }
  );

  const updatedFarmer = await Farmer.findById(membership.farmerId);

  return {
    invoice,
    membership,
    user: updatedFarmer
  };
};

const markPaymentSuccessful = async ({
  payment,
  razorpayPaymentId,
  razorpaySignature,
  paidAt
}) => {
  if (payment.status !== 'SUCCESS') {
    payment.status = 'SUCCESS';
  }

  if (razorpayPaymentId && payment.razorpayPaymentId !== razorpayPaymentId) {
    payment.razorpayPaymentId = razorpayPaymentId;
  }

  if (razorpaySignature && payment.razorpaySignature !== razorpaySignature) {
    payment.razorpaySignature = razorpaySignature;
  }

  if (!payment.paidAt) {
    payment.paidAt = paidAt || new Date();
  }

  await payment.save();

  const sideEffects = await activatePaymentSideEffects(payment);

  return {
    payment,
    ...sideEffects
  };
};

const markPaymentFailed = async (payment) => {
  if (!payment || payment.status === 'SUCCESS' || payment.status === 'FAILED') {
    return payment;
  }

  payment.status = 'FAILED';
  await payment.save();

  return payment;
};

/* ================= CREATE RAZORPAY ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }

    const order = await razorpay.orders.create({
      amount: invoice.totalAmount * 100,
      currency: 'INR',
      receipt: invoice.invoiceNumber
    });

    const payment = await Payment.create({
      farmerId: invoice.farmerId,
      invoiceId: invoice._id,
      razorpayOrderId: order.id,
      amount: invoice.totalAmount,
      status: 'PENDING'
    });

    return res.json({
      orderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: invoice.totalAmount,
      paymentId: payment._id
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY PAYMENT & ACTIVATE MEMBERSHIP ================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'SUCCESS') {
      const sideEffects = await activatePaymentSideEffects(payment);

      return res.json({
        message: 'Payment already verified',
        payment,
        ...sideEffects
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await markPaymentFailed(payment);
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const result = await markPaymentSuccessful({
      payment,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date()
    });

    return res.json({
      message: 'Payment successful',
      payment: result.payment,
      invoice: result.invoice,
      membership: result.membership,
      user: result.user
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY PAYMENT BY RAZORPAY PAYMENT ID ================= */
exports.verifyPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const razorpayPayment = await razorpay.payments.fetch(paymentId);

    let payment = await Payment.findOne({ razorpayPaymentId: paymentId });
    if (!payment && razorpayPayment.order_id) {
      payment = await Payment.findOne({ razorpayOrderId: razorpayPayment.order_id });
    }

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (razorpayPayment.status === 'captured') {
      const result = await markPaymentSuccessful({
        payment,
        razorpayPaymentId: paymentId,
        paidAt: razorpayPayment.created_at
          ? new Date(razorpayPayment.created_at * 1000)
          : new Date()
      });

      return res.json({
        message: 'Payment verified successfully',
        payment: result.payment,
        invoice: result.invoice,
        membership: result.membership,
        user: result.user,
        razorpayStatus: razorpayPayment.status
      });
    }

    if (razorpayPayment.status === 'failed') {
      payment = await markPaymentFailed(payment);
    }

    return res.json({
      message: 'Payment status fetched successfully',
      payment,
      razorpayStatus: razorpayPayment.status
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= RAZORPAY WEBHOOK ================= */
exports.handleWebhook = async (req, res) => {
  try {
    console.log('Razorpay webhook payload:', JSON.stringify(req.body));

    const signature = req.headers['x-razorpay-signature'];
    const isSignatureValid = verifyWebhookSignature(req.rawBody, signature);

    if (!isSignatureValid) {
      console.error('Invalid Razorpay webhook signature');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    const razorpayPaymentId = paymentEntity?.id;
    const razorpayOrderId = paymentEntity?.order_id;

    if (!razorpayPaymentId) {
      return res.status(400).json({ message: 'Missing payment id in webhook payload' });
    }

    let payment = await Payment.findOne({ razorpayPaymentId });
    if (!payment && razorpayOrderId) {
      payment = await Payment.findOne({ razorpayOrderId: razorpayOrderId });
    }

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (event === WEBHOOK_EVENTS.PAYMENT_CAPTURED) {
      const result = await markPaymentSuccessful({
        payment,
        razorpayPaymentId,
        paidAt: paymentEntity.captured_at
          ? new Date(paymentEntity.captured_at * 1000)
          : new Date()
      });

      return res.status(200).json({
        message: 'Webhook processed successfully',
        payment: result.payment
      });
    }

    if (event === WEBHOOK_EVENTS.PAYMENT_FAILED) {
      payment = await markPaymentFailed(payment);

      return res.status(200).json({
        message: 'Webhook processed successfully',
        payment
      });
    }

    return res.status(200).json({
      message: 'Webhook event ignored'
    });

  } catch (err) {
    console.error('Razorpay webhook error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/* ================= GET FARMER PAYMENTS ================= */
exports.getMyPayments = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const payments = await Payment.find({ farmerId })
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
