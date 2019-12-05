const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  favorites: [{
    type: String
  }],
  active_currencies: [{
    type: Object,
    required: true
  }]

});

module.exports = mongoose.model('Portfolio', schema);