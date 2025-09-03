const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message: String,
  level: { type: String, default: 'info' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alert', alertSchema);
