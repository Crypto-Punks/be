const { Router } = require('express');
const Reference = require('../models/reference');
const Portfolio = require('../models/portfolio');
const request = require('superagent');

const BASE_URL = 'api.coincap.io/v2';


// eslint-disable-next-line new-cap
module.exports = Router()

//route to get all coins that are in reference collection
  .get('/all', (req, res, next) => {

    const assetsProm = request
      .get(`${BASE_URL}/assets`)
      .query({ limit: 2000 })
      .then(({ body }) => body.data);

    const coinsProm = Reference
      .find()
      .lean();

    Promise.all([assetsProm, coinsProm])
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
      })
      .then((data) => res.send(data))
      .catch(next);
  })
        
  //route to get user investments
  .get('/invested', (req, res, next) => {
    // const user = req.user._id;
    // Portfolio
    //   .find({ user })
    //   .then(({ investedCoins }) => {
    const investedCoins = ['bitcoin', 'tether'];
    return Promise.all(investedCoins.map(coin => getCoinById(coin)))
      .then(data => res.send(data))
      .catch(next);
  })
  
  //route to get user watch
  .get('/watched', (req, res, next) => {
       // const user = req.user._id;
    // Portfolio
    //   .find({ user })
    //   .then(({ watchList }) => {
    const watchList = ['bitcoin', 'tether'];
    return Promise.all(watchList.map(coin => getCoinById(coin)))
      .then(data => res.send(data))
      .catch(next);
  })

  
  //route to get coin by id
  .get('/:id', (req, res, next) => {
    getCoinById(req.params.id)
      .then((data) => res.send(data))
      .catch(next);
  })
  





  //route that gets top 100 plus user invested/watching
  .get('/', (req, res, next) => {
    // const user = req.user._id;
    // Portfolio
    //   .find({ user })
    //   .then(({ investedCoins, watchList }) => {
    
    const watchList = ['bitcoin', 'tether'];
    const investedCoins = ['bitcoin', 'tether'];

    Promise.all([
      Promise.all(watchList.map(coin => getCoinById(coin))), 
      Promise.all(investedCoins.map(coin => getCoinById(coin))),
      request
        .get(`${BASE_URL}/assets`)
        .then(({ body }) => body.data)
    ])
      .then(([watchList, investedCoins, top100]) => {
        const data = {
          watchList,
          investedCoins,
          top100
        };
        res.send(data);
      })
      .catch(next);

  });




function getCoinById(id) {

  const assetProm = request
    .get(`${BASE_URL}/assets/${id}`)
    .then(({ body }) => body.data);

  const coinProm = Reference
    .find({ id })
    .lean();
      
  return Promise.all([assetProm, coinProm])
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
  