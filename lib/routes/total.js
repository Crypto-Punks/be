const { Router } = require('express');
const Total = require('../models/total');

// eslint-disable-next-line new-cap
module.exports = Router()
  .post('/', (req, res, next) => {
    Total
      .create({ user: req.user._id, timestamp: new Date(), totals: req.body.totals })
      .then(total => res.send(total))
      .catch(next);
  })
  .get('/', (req, res, next) => {
    Total
      .find({ user: req.user._id })
      .then(totals => res.send(totals))
      .catch(next);
  });