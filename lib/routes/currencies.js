const { Router } = require('express');
const Reference = require('../models/reference');
const Portfolio = require('../models/portfolio');
const request = require('superagent');

const BASE_URL = 'api.coincap.io/v2';


// eslint-disable-next-line new-cap
module.exports = Router()

//route to get all coins that are in reference collection
  .get('/all', (req, res, next) => {

    const assetsProm = new Promise((resolve) => {
      request
        .get(`${BASE_URL}/assets`)
        .query({ limit: 2000 })
        .then(({ body }) => {
          resolve(body.data);
        });
    });

    const coinsProm = new Promise((resolve) => {
      Reference
        .find()
        .then(coins => resolve(coins));
    });

    Promise.all([assetsProm, coinsProm])
      .then(([assets, coins]) => {
        return assets.map(asset => {
          return coins.reduce((acc, coin) => {
            if(coin.id === asset.id) {
              acc = {
                ...asset,
                currencySymbol: coin.logo,
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
      })
      .then((data) => res.send(data))
      .catch(next);
  })
        
  //route to get user investments
  .get('/invested', (req, res, next) => {
    const user = req.user._id;
    Portfolio
      .find({ user })
      .then(({ investedCoins }) => {
        Promise.all(investedCoins.map(coin => {
          getCoinById(coin.name, res, next);
        }))
          .then((res) => {
            console.log(res);
          });

      });
    //get user invested list, call get by id for each of those.
    //return 
    
  })
  
  //route to get user watch
  .get('/watched')

  
  //route to get coin by id
  .get('/:id', (req, res, next) => {
    getCoinById(req.params.id, res, next);
  })
  

  //route that gets top 100 plus user invested/watching
  .get('/');


function getCoinById(id, res, next) {
  const assetProm = new Promise((resolve) => {
    request
      .get(`${BASE_URL}/assets/${id}`)
      .then(({ body }) => {
        resolve(body.data);
      });
  });
  const coinProm = new Promise((resolve) => {
    Reference
      .find({ id })
      .then(coins => resolve(coins));
  });
  Promise.all([assetProm, coinProm])
    .then(([asset, coin]) => {
      if(coin)
        coin = coin[0];
      return {
        ...asset,
        currencySymbol: coin.logo,
        description: coin.description,
        website: coin.website
      };
    })
    .then((data) => res.send(data))
    .catch(next);
}
  