const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true
    },
    password_hash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'ADMIN'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);