const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true
    },

    motorName: {
      type: String,
      trim: true,
      required: true
    },

    hp: {
      type: Number
    },

    company: {
      type: String,
      trim: true
    },

    photoUrl: {
      type: String,
      required: true,
      trim: true
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },

    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },

    status: {
      type: String,
      enum: ['PENDING','INVOICED', 'ACTIVE'], //invoiced added on 23-04
      default: 'PENDING'
    },

    linkedMembershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      default: null
    }
  },
  {
    timestamps: true,
    minimize: false
  }
);

motorSchema.index({ farmerId: 1, timestamp: -1 });

module.exports = mongoose.model('Motor', motorSchema);
