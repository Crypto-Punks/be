const { Router } = require('express');
const Portfolio = require('../models/portfolio');

// eslint-disable-next-line new-cap
module.exports = Router()
  .get('/', (req, res, next) => {
    Portfolio
      .findOne({ user: req.user._id })
      .then(portfolio => {
        res.send({
          watchList: portfolio.watchList,
          investedCoins: portfolio.investedCoins
        });
      })
      .catch(next);
  })
  .put('/', (req, res, next) => {
    Portfolio
      .findOneAndUpdate({ user: req.user._id }, { ...req.body }, { new: true })
      .then(portfolio => {
        res.send(portfolio);
      })
      .catch(next);
  });
