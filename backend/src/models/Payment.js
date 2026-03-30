const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
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
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },

    paidAt: Date
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true });
paymentSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
