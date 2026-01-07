const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    motorCount: {
      type: Number,
      required: true
    },

    amountWithoutGst: {
      type: Number,
      required: true
    },

    gstAmount: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'EXPIRED'],
      default: 'PENDING'
    },

    startDate: Date,
    expiryDate: Date,

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Membership', membershipSchema);