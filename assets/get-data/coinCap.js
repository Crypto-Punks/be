const json = require('./coinCap.json.js');


const coinCapData = json.data.map(data => {
  return {
    id: data.id,
    symbol: data.symbol
  };
});

module.exports = coinCapData;