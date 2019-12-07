const { Router } = require('express');
const Reference = require('../models/reference');


// eslint-disable-next-line new-cap
module.exports = Router()
  .get('/all', (req, res) => {
    Reference
      .find()
      .then(coins => {
        return coins.map(coin => {
          return coin.symbol;
        });
      })
      .then(symbols => {
        return symbols.reduce((acc, symbol) => {
          acc += `${symbol},`;
        }, '').slice(0, -1);
      })
      .then(query => {

      });
  })

  .get('/:id', (req, res) => {
    Reference
      .findOne({})
      .then(coins => {
        return coins.map(coin => {
          return coin.symbol;
        });
      })
      .then(symbols => {
        return symbols.reduce((acc, symbol) => {
          acc += `${symbol},`;
        }, '').slice(0, -1);
      })
      .then(query => {

      });
  })



  .get('/', (req, res) => {
    Reference
      .find()
      .then(coins => {
        return coins.map(coin => {
          return coin.symbol;
        });
      })
      .then(symbols => {
        return symbols.reduce((acc, symbol) => {
          acc += `${symbol},`;
        }, '').slice(0, -1);
      })
      .then(query => {
        
      });
  });
