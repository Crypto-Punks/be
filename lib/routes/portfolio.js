const { Router } = require('express');
const Portfolio = require('../models/portfolio');

// eslint-disable-next-line new-cap
module.exports = Router()
  .post('/', (req, res, next) => {
    Portfolio
      .create({ user: req.user._id, watchList: [], investedCoins: [{ name: 'USD', amount: 10000 }] })
      .then(portfolio => {
        res.send(portfolio);
      })
      .catch(next);
  })
  .get('/', (req, res, next) => {
    Portfolio
      .findOne({ user: req.user._id })
      .then(portfolio => {
        res.send(portfolio);
      })
      .catch(next);
  });