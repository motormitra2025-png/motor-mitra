const Motor = require('../models/Motor');
const Farmer = require('../models/Farmer');

/* ================= ADD MOTORS (PENDING) ================= */
exports.addMotors = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { motors } = req.body;

    if (!Array.isArray(motors) || motors.length === 0) {
      return res.status(400).json({ message: 'No motors provided' });
    }

    const createdMotors = [];

    for (const m of motors) {
      const motor = await Motor.create({
        farmerId,
        motorName: m.motorName,
        hp: m.hp,
        company: m.company,
        photoUrl: m.photoUrl,
        location: {
          latitude: m.latitude,
          longitude: m.longitude
        },
        status: 'PENDING'
      });

      createdMotors.push(motor);
    }

    res.status(201).json({
      message: 'Motors added successfully (pending)',
      motorCount: createdMotors.length,
      motors: createdMotors
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};