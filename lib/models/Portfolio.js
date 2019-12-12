const mongoose = require('mongoose');
const request = require('superagent');
const Total = require('./Total');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  watchList: [{
    name: {
      type: String,
      required: true
    }
  }],
  investedCoins: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }]
});

const getQuery = (userId) => userId ? { user: userId } : {};

schema.static('getCoinPrices', function(userId) {
  return this 
    .distinct('investedCoins.name', getQuery(userId))
    .then(coinNames => {
      return Promise.all(coinNames.map(coinName => {
        if(coinName === 'USD') return { id: coinName, priceUsd: 1.0000000 };
        return request
          .get(`api.coincap.io/v2/assets/${coinName}`)
          .then(({ body }) => {
            return {
              id: body.data.id,
              priceUsd: Number(body.data.priceUsd),
            };
          });
      }))
        .then(coinPrices => {
          return coinPrices.reduce((acc, coinPrice) => {
            acc[coinPrice.id] = coinPrice.priceUsd;
            return acc;
          }, {});
        }); 
    });
});

schema.static('getInvestments', function(userId) {
  return this
    .find(getQuery(userId))
    .select('investedCoins user')
    .lean();
});

schema.static('createTotals', function(userId) {
  return Promise.all([
    this.getInvestments(userId),
    this.getCoinPrices(userId)
  ])
    .then(([portfolios, coinPrices]) => {
      return Total.createTotals(portfolios, coinPrices);
    });
});

module.exports = mongoose.model('Portfolio', schema);

