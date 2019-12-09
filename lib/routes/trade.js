const { Router } = require('express');
const Trade = require('../models/trade');

// eslint-disable-next-line new-cap
module.exports = Router()
  .post('/', (req, res, next) => {
    const { exchange_rate, from_currency, to_currency } = req.body;
    Trade
      .create({ user: req.user._id, timestamp: new Date(), exchange_rate, from_currency, to_currency })
      .then(trade => res.send(trade))
      .catch(next);
  });