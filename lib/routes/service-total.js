const { Router } = require('express');


const Portfolio = require('../models/Portfolio');

// eslint-disable-next-line new-cap
module.exports = Router()
//route to create total automatically
  .post('/', (req, res, next) => {
    Portfolio.createTotals()
      .then(() => res.send({ success: true }))
      .catch(next);
  });
