const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    required: true
  },
  exchange_rate: {
    type: Number,
    required: true
  },
  from_currency: {
    type: String,
    required: true
  },
  to_currency: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Trade', schema);