const Membership = require('../models/Membership');

exports.getMyMemberships = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const memberships = await Membership.find({ farmerId })
      .sort({ createdAt: -1 });

    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};