require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/Admin');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const exists = await Admin.findOne({ username: 'admin' });
    if (exists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hash = await bcrypt.hash('admin123', 10);

    await Admin.create({
      username: 'admin',
      password_hash: hash
    });

    console.log('Admin created successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();