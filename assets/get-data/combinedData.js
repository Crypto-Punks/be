const marketCapData = require('./coinCapMarket');
const coinCapData = require('./coinCap');
const fs = require('fs');

const combinedData = marketCapData.map(mcData => {
  const ccData = coinCapData.find(element => mcData.symbol === element.symbol);
  if(ccData) {
    return {
      id: ccData.id,
      symbol: ccData.symbol,
      description: mcData.description,
      website: mcData.urls.website[0],
      logo: mcData.logo
    };
  }
})
  .reduce((arr, obj) => {
    if(obj) arr.push(obj);
    return arr;
  }, []);


fs.writeFileSync('json-data.json', JSON.stringify(combinedData, true, 2));

//cli command: mongoimport -d crypto-punk -c references --jsonArray --file json-data.json
