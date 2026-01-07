const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: String,
    razorpaySignature: String,

    amount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['CREATED', 'SUCCESS', 'FAILED'],
      default: 'CREATED'
    },

    paidAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);