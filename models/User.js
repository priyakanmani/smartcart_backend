// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: String,
//   isActive: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require("mongoose");  // <-- add this line

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "owner", "customer"], required: true },
  shopId: { type: String }, // only for manager/owner
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
