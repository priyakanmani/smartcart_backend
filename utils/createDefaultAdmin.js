const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const email = 'admin@smartcart.com';
  const plainPassword = 'admin123';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('⚠️ Admin already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const newAdmin = new Admin({ email, password: hashedPassword });
  await newAdmin.save();

  console.log('✅ Admin created successfully');
  process.exit(0);
}

createAdmin();
