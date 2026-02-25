const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    motorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motor'
      }
    ],
    invoiceNumber: {
      type: String,
      unique: true
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    },

    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership'
    },

    motorsSnapshot: [
      {
        motorName: String,
        hp: Number,
        company: String,
        photoUrl: String,
        location: {
          latitude: Number,
          longitude: Number
        }
      }
    ],

    baseAmount: Number,
    gstAmount: Number,
    totalAmount: Number,

    status: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);