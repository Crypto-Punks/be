const { Router } = require('express');
const Reference = require('../models/reference');
const Portfolio = require('../models/portfolio');
const request = require('superagent');

const BASE_URL = 'api.coincap.io/v2';


// eslint-disable-next-line new-cap
module.exports = Router()

//route to get all coins that are in reference collection
  .get('/all', (req, res, next) => {
    getCoins('all')
      .then((data) => res.send(data))
      .catch(next);
  })
        

  //route to get user investments
  .get('/invested', (req, res, next) => {
    const user = req.user._id;
    Portfolio
      .find({ user })
      .lean()
      .then(([user]) => {
        return Promise.all(getCoinsById(user.investedCoins));
      })
      .then(data => res.send(data))
      .catch(next);
  })
  

  //route to get user watch
  .get('/watched', (req, res, next) => {
    const user = req.user._id;
    Portfolio
      .find({ user })
      .lean()
      .then(([user]) => {
        return Promise.all(getCoinsById(user.watchList));
      })
      .then(data => res.send(data))
      .catch(next);
  })

  
  //route to get coin by id
  .get('/:id', (req, res, next) => {
    getCoinsById([{ name: req.params.id }])
      .then((data) => res.send(data))
      .catch(next);
  })
  

  //route that gets top 100 plus user invested/watching
  .get('/', (req, res, next) => {
    const user = req.user._id;
    Portfolio
      .find({ user })
      .lean()
      .then(([user]) => {
        console.log(user.investedCoins);
        return Promise.all([
          Promise.all(getCoinsById(user.watchList)), 
          Promise.all(getCoinsById(user.investedCoins)),
          getCoins()
        ])
          .then(([watchList, investedCoins, top100Coins]) => {
            const data = {
              watchList,
              investedCoins,
              top100Coins
            };
            res.send(data);
          })
          .catch(next);

      });

  });


function getCoins(all) {
  const query = all ? { limit: 2000 } : null;
  
  const assetsReq = request
    .get(`${BASE_URL}/assets`)
    .query(query)
    .then(({ body }) => body.data);

  const coinsReq = Reference
    .find()
    .lean();

  return Promise.all([assetsReq, coinsReq])
    .then(([assets, coins]) => {
      return assets.map(asset => {
        return coins.reduce((acc, coin) => {
          if(coin.id === asset.id) {
            acc = {
              ...asset,
              currencySymbol: coin.logo,
              description: coin.description,
              website: coin.website
            };
          }
          return acc;
        }, {});
      }).reduce((acc, obj) => {
        if(obj.id) {
          acc.push(obj);
        }
        return acc;
      }, []);
    });
 
}




function getCoinsById(array) {

  return array.map(coin => {
    if(coin.name !== 'USD') {
      const assetReq = request
        .get(`${BASE_URL}/assets/${coin.name}`)
        .then(({ body }) => body.data);

      const coinReq = Reference
        .find({ id: coin.name })
        .lean();
      
      return Promise.all([assetReq, coinReq])
        .then(([asset, coin]) => {
          if(coin) coin = coin[0];
          return {
            ...asset,
            currencySymbol: coin.logo,
            description: coin.description,
            website: coin.website
          };
        });
    }
  }).reduce((acc, coin) => {
    if(coin) {
      acc.push(coin);
    }
    return acc;
  }, []);
}
  