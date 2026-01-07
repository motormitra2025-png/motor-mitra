const Farmer = require('../models/Farmer');
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { generateId } = require('../utils/idGenerator');

/**


/**
 * UPDATE FARMER PROFILE
 */
/*exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Do NOT allow PIN change here
    delete updates.pin;

    const farmer = await Farmer.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-pin');

    res.json(farmer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};*/

//const Farmer = require('../models/Farmer');

/* ================= UPDATE FARMER PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    // ✅ Only allow these fields to be updated
    const allowedUpdates = [
      'full_name',
      'father_name',
      'village',
      'mandal',
      'district',
      'state',
      'pincode',
      'land_area_acres',
      'east_boundary',
      'west_boundary',
      'north_boundary',
      'south_boundary'
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const farmer = await Farmer.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-pin_hash');

    res.json({
      message: 'Profile updated successfully',
      farmer
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* STEP 1: VERIFY FARMER */
exports.verifyFarmerForReset = async (req, res) => {
  try {
    const { mobile, aadhaar_last4 } = req.body;

    if (!mobile || !aadhaar_last4) {
      return res.status(400).json({ message: 'Missing details' });
    }

    const farmer = await Farmer.findOne({ mobile, aadhaar_last4 });
    if (!farmer) {
      return res.status(404).json({ message: 'Details do not match' });
    }

    res.json({
      message: 'Verification successful',
      farmerId: farmer.farmerId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* STEP 2: RESET PIN */
exports.resetFarmerPin = async (req, res) => {
  try {
    const { mobile, newPin } = req.body;

    if (!mobile || !newPin) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const farmer = await Farmer.findOne({ mobile });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    farmer.pin_hash = hashedPin;
    await farmer.save();

    res.json({ message: 'PIN reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



 
exports.registerFarmer = async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      mobile,
      pin_hash,
      aadhaar_last4,
      village,
      mandal,
      district,
      state,
      pincode,
      land_area_acres,
      passbook_last6,
      east_boundary,
      west_boundary,
      north_boundary,
      south_boundary,
      referredByAgentId, // OPTIONAL
    } = req.body;

    // Check existing farmer
    const exists = await Farmer.findOne({ mobile });
    if (exists) {
      return res.status(400).json({ message: 'Farmer already registered' });
    }

    // Validate Agent ID if provided
    if (referredByAgentId) {
      const agentExists = await Agent.findOne({
        agentId: referredByAgentId,
      });

      if (!agentExists) {
        return res.status(400).json({ message: 'Invalid Agent ID' });
      }
    }

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin_hash, 10);

    // Create farmer
    const farmer = await Farmer.create({
      farmerId: generateId('FMR'),
      full_name,
      father_name,
      mobile,
      pin_hash: hashedPin,
      aadhaar_last4,
      village,
      mandal,
      district,
      state,
      pincode,
      land_area_acres,
      passbook_last6,
      east_boundary,
      west_boundary,
      north_boundary,
      south_boundary,
      referredByAgentId: referredByAgentId || null,
      role: 'FARMER',
      membership: {
        active: false,
        expiryDate: null,
      },
    });

    res.status(201).json({
      message: 'Farmer registered successfully',
      farmerId: farmer.farmerId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * FARMER LOGIN
 * - Mobile + PIN
 */
exports.loginFarmer = async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    const farmer = await Farmer.findOne({ mobile });
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const match = await bcrypt.compare(pin, farmer.pin_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    const token = generateToken({
      id: farmer._id,
      role: 'FARMER',
    });

    res.json({
      token,
      farmer,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * FARMER PROFILE
 */
exports.getProfile = async (req, res) => {
  const farmer = await Farmer.findById(req.user.id).select('-pin');
  res.json(farmer);
};

/**
 * FARMER MEMBERSHIP STATUS
 */
exports.getMembershipStatus = async (req, res) => {
  const farmer = await Farmer.findById(req.user.id);
  res.json(farmer.membership);
};