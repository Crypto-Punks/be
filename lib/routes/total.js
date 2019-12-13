const { Router } = require('express');

const Total = require('../models/Total');
const Portfolio = require('../models/Portfolio');

// eslint-disable-next-line new-cap
module.exports = Router()
//route to create total automatically
  .post('/', (req, res, next) => {
    Portfolio.createTotals()
      .then(() => res.send({ success: true }))
      .catch(next);
  })

  //route to create new total when new trade is made
  .post('/:id', (req, res, next) => {
    Portfolio.createTotals(req.params.id)
      .then(() => res.send({ success: true }))
      .catch(next);
  })

  .get('/', (req, res, next) => {
    Total
      .find({ user: req.user._id })
      .then(totals => res.send(totals))
      .catch(next);
  });
 