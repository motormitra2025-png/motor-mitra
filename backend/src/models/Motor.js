const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true
    },

    motorName: {
      type: String
    },

    hp: {
      type: Number,
      required: true
    },

    company: {
      type: String,
      required: true
    },

    photoUrl: {
      type: String,
      required: true
    },

    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },

    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE'],
      default: 'PENDING'
    },

    linkedMembershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Motor', motorSchema);