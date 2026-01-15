const Membership = require('../models/Membership');

const Membership = require('../models/Membership');
const Motor = require('../models/Motor');

exports.getMyMemberships = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const memberships = await Membership.find({ farmerId })
      .sort({ createdAt: -1 })
      .lean();

    const membershipsWithMotors = await Promise.all(
      memberships.map(async (membership) => {
        const motors = await Motor.find({
          linkedMembershipId: membership._id
        });

        return {
          ...membership,
          motors
        };
      })
    );

    res.json(membershipsWithMotors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};