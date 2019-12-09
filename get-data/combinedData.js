const marketCapData = require('./coinCapMarket');
const coinCapData = require('./coinCap');
const ccRatesData = require('./coinCapRates');
const fs = require('fs');


const combinedData = marketCapData.map(mcData => {
  return coinCapData.reduce((acc, ccData) => {
    if(mcData.symbol === ccData.symbol) {
      acc.id = ccData.id,
      acc.symbol = ccData.symbol,
      acc.description = mcData.description;
    
      if(mcData.urls.website[0]) acc.website = mcData.urls.website[0];
    }
    return acc;
  }, {});
})
  .reduce((arr, obj) => {

    if(obj.id) {
      arr.push(obj);
    }
    return arr;
  }, [])
  .map(ccData => {
    return ccRatesData.reduce((acc, ratesData) => {
      if(ccData.symbol === ratesData.symbol) {
        acc = {
          ...ccData,
          currencyLogo: ratesData.currencySymbol
        };
      }
      return acc;
    }, {});
  })
  .reduce((arr, obj) => {

    if(obj.id) {
      arr.push(obj);
    }
    return arr;
  }, []);




fs.writeFileSync('json-data.json', JSON.stringify(combinedData, true, 2));

//cli command: mongoimport -d crypto-punk -c references --jsonArray --file json-data.json
