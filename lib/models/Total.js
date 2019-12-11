const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  totals: [{
    type: Object,
    required: true
  }]
});

module.exports = mongoose.model('Total', schema);