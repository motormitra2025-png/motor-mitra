const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    unique: true,
    index: true
  },

  full_name: {
    type: String,
    required: true
  },

  mobile: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  aadhaar_last4: {
    type: String,
    required: true
  },

  village: String,
  mandal: String,
  district: String,
  state: { type: String, default: 'Telangana' },
  pincode: String,

  pin_hash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: 'AGENT'
  }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);