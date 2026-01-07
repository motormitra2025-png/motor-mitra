const crypto = require('crypto');
const razorpay = require('../config/razorpay');

const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const Motor = require('../models/Motor');
const Invoice = require('../models/Invoice');

/* ================= CREATE RAZORPAY ORDER ================= */
exports.createOrder = async (req, res) => {
  try {
    const { membershipId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const order = await razorpay.orders.create({
      amount: membership.totalAmount * 100, // paise
      currency: 'INR'
    });

    const payment = await Payment.create({
      farmerId: membership.farmerId,
      razorpayOrderId: order.id,
      amount: membership.totalAmount
    });

    res.json({
      orderId: order.id,
      amount: membership.totalAmount,
      paymentId: payment._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY PAYMENT & ACTIVATE MEMBERSHIP ================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      membershipId
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const membership = await Membership.findById(membershipId);
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!membership || !payment) {
      return res.status(404).json({ message: 'Invalid payment or membership' });
    }

    /* Update payment */
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    /* Activate membership */
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 15);

    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    membership.status = 'ACTIVE';
    membership.startDate = startDate;
    membership.expiryDate = expiryDate;
    membership.paymentId = payment._id;
    await membership.save();

    /* Activate motors */
    await Motor.updateMany(
      { farmerId: membership.farmerId, status: 'PENDING' },
      { status: 'ACTIVE', linkedMembershipId: membership._id }
    );

    /* Mark invoice paid */
    await Invoice.updateOne(
      { membershipId },
      { status: 'PAID' }
    );

    res.json({
      message: 'Payment successful. Membership activated.'
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};