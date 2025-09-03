const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@smartcart.com';
  const plainPassword = 'admin123';

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const admin = new Admin({ email, password: hashedPassword });

  await admin.save();
  console.log('✅ Admin created');
  process.exit();
}

createAdmin();
