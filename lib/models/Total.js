const mongoose = require('mongoose');
const { evaluate } = require('mathjs');

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  totals: [{
    type: Object,
    required: true
  }]
}, { 
  timestamps: {
    createdAt: 'timestamp',
    updatedAt: false
  }
});

schema.static('createTotals', function(portfolios, coinPrices) {
  const totals = portfolios.map(({ _id: portfolioId, investedCoins, user }) => {
    return { 
      portfolioId,
      user,
      totals: investedCoins.flatMap(coin => {
        const priceUsd = coinPrices[coin.name];
        return {
          name: coin.name,
          amount: coin.amount,
          priceUsd,
          value: evaluate(Number(coin.amount) * priceUsd)
        };
      })
    };
  });
  return this.insertMany(totals);
});
module.exports = mongoose.model('Total', schema);
