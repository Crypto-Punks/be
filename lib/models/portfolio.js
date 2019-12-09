const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  watchList: [{
    type: String,
  }],
  investedCoins: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }]
});

module.exports = mongoose.model('Portfolio', schema);
