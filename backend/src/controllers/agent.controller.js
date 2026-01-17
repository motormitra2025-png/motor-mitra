const Agent = require('../models/Agent');
const Farmer = require('../models/Farmer');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { generateId } = require('../utils/idGenerator');

/* ================= REGISTER AGENT ================= */
exports.registerAgent = async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      pin,
      aadhaar_last4,
      village,
      mandal,
      district,
      state,
      pincode
    } = req.body;

    const exists = await Agent.findOne({ mobile });
    if (exists) {
      return res.status(400).json({ message: 'Agent already registered' });
    }

    const pin_hash = await bcrypt.hash(pin, 10);

    const agent = await Agent.create({
      agentId: generateId('AGT'),
      full_name,
      mobile,
      pin_hash,
      aadhaar_last4,
      village,
      mandal,
      district,
      state,
      pincode,
      role: 'AGENT'
    });

    res.status(201).json({
      message: 'Agent registered successfully',
      agentId: agent.agentId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN AGENT ================= */
exports.loginAgent = async (req, res) => {
  try {
    const { mobile, pin } = req.body;

    const agent = await Agent.findOne({ mobile });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const match = await bcrypt.compare(pin, agent.pin_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    const token = generateToken({
      id: agent._id,
      role: 'AGENT',
      agentId: agent.agentId
    });

    res.json({ token, agent });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= AGENT PROFILE ================= */
exports.getProfile = async (req, res) => {
  const agent = await Agent.findById(req.user.id).select('-pin_hash');
  res.json(agent);
};

/* ================= AGENT FARMERS ================= */
exports.getMyFarmers = async (req, res) => {
  const agent = await Agent.findById(req.user.id);

  const farmers = await Farmer.find({
    referredByAgentId: agent.agentId
  }).select('-pin_hash');

  res.json(farmers);
};

/* ================= VERIFY RESET ================= */
exports.verifyReset = async (req, res) => {
  const { mobile, aadhaar_last4 } = req.body;

  const agent = await Agent.findOne({ mobile, aadhaar_last4 });
  if (!agent) {
    return res.status(400).json({ message: 'Verification failed' });
  }

  res.json({ message: 'Verification successful' });
};

/* ================= RESET PIN ================= */
exports.resetPin = async (req, res) => {
  const { mobile, newPin } = req.body;

  const agent = await Agent.findOne({ mobile });
  if (!agent) {
    return res.status(404).json({ message: 'Agent not found' });
  }

  agent.pin_hash = await bcrypt.hash(new_pin, 10);
  await agent.save();

  res.json({ message: 'PIN updated successfully' });
};
