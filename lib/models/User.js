const mongoose = require('mongoose');
const { hashSync, compareSync } = require('bcryptjs');
const { sign, verify } = require('jsonwebtoken');

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
    }
  }
});

schema.virtual('password').set(function(password) {
  this.passwordHash = hashSync(password, 10);
});

schema.methods.compare = function(password) {
  return compareSync(password, this.passwordHash);
};

schema.methods.token = function() {
  return sign({ ...this.toJSON() }, process.env.APP_SECRET, {
    expiresIn: '24h'
  });
};

schema.statics.findByToken = function(token) {
  const payload = verify(token, process.env.APP_SECRET);
  return this.findById(payload._id);
};

module.exports = mongoose.model('User', schema);
