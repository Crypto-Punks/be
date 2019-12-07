const marketCapData = require('./coinCapMarket');
const coinCapData = require('./coinCap');
const fs = require('fs');


const combinedData = marketCapData.map(mcData => {
  return coinCapData.reduce((acc, ccData) => {
    if(mcData.symbol === ccData.symbol) {
      acc.id = ccData.id,
      acc.symbol = ccData.symbol,
      acc.logo = mcData.logo,
      acc.slug = mcData.slug,
      acc.description = mcData.description;
    
      if(mcData.urls.website[0]) acc.website = mcData.urls.website[0];
    }
    return acc;
  }, {});
}).reduce((arr, obj) => {

  if(obj.id) {
    arr.push(obj);
  }
  return arr;
}, []);


fs.writeFileSync('json-data.json', JSON.stringify(combinedData, true, 2));

//cli command: mongoimport -d crypto-punk -c reference --jsonArray --file json-data.json
