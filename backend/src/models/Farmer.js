const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    farmerId: {
      type: String,
      unique: true,
      index: true,
    },

    full_name: {
      type: String,
      required: true,
    },

    father_name: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    aadhaar_last4: {
      type: String,
      minlength: 4,
      maxlength: 4,
    },

    village: String,
    mandal: String,
    district: String,

    state: {
      type: String,
      default: 'Telangana',
    },

    pincode: String,
    land_area_acres: Number,
    passbook_last6: String,

    east_boundary: String,
    west_boundary: String,
    north_boundary: String,
    south_boundary: String,

    pin_hash: {
      type: String,
      required: true,
    },

    referredByAgentId: {
      type: String,
      default: null,
    },

    membership: {
      isActive: {
        type: Boolean,
        default: false,
      },
      startDate: Date,
      expiryDate: Date,
      motorCount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farmer', farmerSchema);