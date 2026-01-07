const Admin = require('../models/Admin');
const Farmer = require('../models/Farmer');
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

/* ================= ADMIN LOGIN ================= */
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({
    id: admin._id,
    role: 'ADMIN'
  });

  res.json({ token });
};

/* ================= GET ALL FARMERS ================= */
exports.getAllFarmers = async (req, res) => {
  const farmers = await Farmer.find().select('-pin_hash');
  res.json(farmers);
};

/* ================= GET ALL AGENTS ================= */
exports.getAllAgents = async (req, res) => {
  const agents = await Agent.find().select('-pin_hash');
  res.json(agents);
};

/* ================= FARMERS BY AGENT ================= */
exports.getFarmersByAgent = async (req, res) => {
  const { agentId } = req.params;

  const farmers = await Farmer.find({
    referredByAgentId: agentId
  }).select('-pin_hash');

  res.json(farmers);
};

/* ================= DASHBOARD STATS ================= */
exports.getStats = async (req, res) => {
  const farmerCount = await Farmer.countDocuments();
  const agentCount = await Agent.countDocuments();

  res.json({
    totalFarmers: farmerCount,
    totalAgents: agentCount
  });
};