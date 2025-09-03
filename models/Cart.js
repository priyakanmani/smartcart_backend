const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cart_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available'
  },
  location: {
    type: String,
    default: 'Warehouse'
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: String,
    default: 'System'
  },
  complaints: [{
    type: {
      type: String,
      required: true
    },
    description: String,
    reported_by: String,
    date_reported: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending'
    },
    date_resolved: Date,
    resolved_by: String
  }],
  reviews: [{
    customer_id: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);