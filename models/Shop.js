// const mongoose = require('mongoose');

// const shopSchema = new mongoose.Schema({
//   name: String,
//   address: String,
//   owner: String,
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('managers', shopSchema);
const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);
