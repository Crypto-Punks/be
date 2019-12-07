const json = require('./coinCap.json');


const coinCapData = json.data.map(data => {
  return {
    id: data.id,
    symbol: data.symbol
  };
});

module.exports = coinCapData;