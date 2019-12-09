const json = require('./coinCapRates.json');


const coinCapRatesData = json.map(data => {
  return {
    symbol: data.symbol,
    currencySymbol: data.currencySymbol
  };
});

module.exports = coinCapRatesData;
