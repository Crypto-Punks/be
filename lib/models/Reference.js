const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  slug:{
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  }
});

schema.static('refRequest', function(selectString, id) {
  const query = id ? { id } : {};
  return this
    .find(query)
    .select(selectString)
    .lean();
});

module.exports = mongoose.model('Reference', schema);
