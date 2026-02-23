const crypto = require('crypto');
const razorpay = require('../utils/razorpay');

const Payment = require('../models/Payment');
const Membership = require('../models/Membership');
const Motor = require('../models/Motor');
const Invoice = require('../models/Invoice');
const Farmer = require('../models/Farmer');

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
      amount: invoice.totalAmount
    });

    res.json({
      orderId: order.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: invoice.totalAmount,
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
      razorpay_signature
    } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'SUCCESS') {
      return res.json({ message: 'Payment already verified' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      await payment.save();
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // ✅ Update payment
    payment.status = 'SUCCESS';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    // ✅ Mark invoice PAID
    const invoice = await Invoice.findByIdAndUpdate(
      payment.invoiceId,
      { status: 'PAID' },
      { new: true }
    );

    // ✅ Activate membership
    const membership = await Membership.findById(invoice.membershipId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 15);

    const expiryDate = new Date(startDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    membership.status = 'ACTIVE';
    membership.startDate = startDate;
    membership.expiryDate = expiryDate;
    membership.paymentId = payment._id;
    await membership.save();

    // ✅ Update Farmer membership snapshot
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

    // ✅ Activate motors
    await Motor.updateMany(
      { farmerId: membership.farmerId, status: 'INVOICED' },
      { status: 'ACTIVE', linkedMembershipId: membership._id }
    );

    const updatedFarmer = await Farmer.findById(membership.farmerId); //added 23-02

    res.json({
      message: 'Payment successful',
      invoice,
      membership,
      user: updatedFarmer //removed farmer key and aded user;
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controllers/payment.controller.js
exports.getMyPayments = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const payments = await Payment.find({ farmerId })
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};