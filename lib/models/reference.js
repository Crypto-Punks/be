const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  symbol: {
    type: String,
    required: true
  },
  logo: String,
  slug: String,
  description: String,
  website: String
});

module.exports = mongoose.model('Reference', schema);
