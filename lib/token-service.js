require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);
const APP_SECRET = process.env.APP_SECRET || 'change me now';

module.exports = {
  sign(user) {
    return sign({ id: user._id }, APP_SECRET);
  },
  
  verify(token) {
    return verify(token, APP_SECRET);
  }
};
