const mongoose = require('mongoose');
const Motor = require('../models/Motor');
const Farmer = require('../models/Farmer');

const isValidUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (err) {
    return false;
  }
};

const validateMotorPayload = (motor, index) => {
  const requiredFields = [
    'motorName',
    'photoUrl',
    'latitude',
    'longitude',
    'address',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (
      motor[field] === undefined ||
      motor[field] === null ||
      motor[field] === ''
    ) {
      return `motors[${index}].${field} is required`;
    }
  }

  if (typeof motor.motorName !== 'string' || !motor.motorName.trim()) {
    return `motors[${index}].motorName must be a non-empty string`;
  }

  if (typeof motor.address !== 'string' || !motor.address.trim()) {
    return `motors[${index}].address must be a non-empty string`;
  }

  if (typeof motor.latitude !== 'number' || Number.isNaN(motor.latitude)) {
    return `motors[${index}].latitude must be a valid number`;
  }

  if (typeof motor.longitude !== 'number' || Number.isNaN(motor.longitude)) {
    return `motors[${index}].longitude must be a valid number`;
  }

  if (!isValidUrl(motor.photoUrl)) {
    return `motors[${index}].photoUrl must be a valid URL`;
  }

  if (Number.isNaN(new Date(motor.timestamp).getTime())) {
    return `motors[${index}].timestamp must be a valid date`;
  }

  return null;
};

/* ================= ADD MOTORS (PENDING) ================= */
exports.addMotors = async (req, res) => {
  try {
    const { farmerId, motors } = req.body;

    if (!farmerId) {
      return res.status(400).json({ message: 'farmerId is required' });
    }

    if (req.user?.role === 'FARMER' && farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmerId' });
    }

    const farmerExists = await Farmer.findById(farmerId).select('_id');
    if (!farmerExists) {
      return res.status(404).json({ message: 'Farmer not found' });
    }


    if (!Array.isArray(motors) || motors.length === 0) {
      return res.status(400).json({ message: 'No motors provided' });
    }

    for (let index = 0; index < motors.length; index += 1) {
      const validationError = validateMotorPayload(motors[index], index);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
    }

    const motorDocs = motors.map((motor) => ({
      farmerId,
      motorName: motor.motorName.trim(),
      hp: motor.hp,
      company: motor.company ? motor.company.trim() : undefined,
      photoUrl: motor.photoUrl.trim(),
      latitude: motor.latitude,
      longitude: motor.longitude,
      address: motor.address.trim(),
      timestamp: new Date(motor.timestamp),
      location: {
        latitude: motor.latitude,
        longitude: motor.longitude
      },
      status: 'PENDING'
    }));

    const createdMotors = await Motor.insertMany(motorDocs);

    return res.status(201).json({
      message: 'Motors added successfully',
      motorCount: createdMotors.length,
      motors: createdMotors
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= GET MOTORS BY FARMER ================= */
exports.getMotorsByFarmerId = async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmerId' });
    }

    if (req.user?.role === 'FARMER' && farmerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const farmerExists = await Farmer.findById(farmerId).select('_id');
    if (!farmerExists) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const motors = await Motor.find({ farmerId })
      .sort({ timestamp: -1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: 'Motors fetched successfully',
      count: motors.length,
      motors
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
