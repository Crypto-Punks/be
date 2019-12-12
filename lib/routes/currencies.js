const { Router } = require('express');
const request = require('superagent');

const Reference = require('../models/Reference');
const Portfolio = require('../models/Portfolio');

const BASE_URL = 'api.coincap.io/v2';


// eslint-disable-next-line new-cap
module.exports = Router()

//route to get all coins that are in api/reference collection
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
        return getCoinsById(user.investedCoins);
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
        return getCoinsById(user.watchList);
      })
      .then(data => res.send(data))
      .catch(next);
  })

  
  //route for user search
  .get('/search/:query', (req, res, next) => {
    const query = req.params.query;

    const assetsReq = request
      .get(`${BASE_URL}/assets?search=${query}`)
      .then(({ body }) => body.data);

    const coinsReq = Reference
      .find({ id: query })
      .lean();

    return Promise.all([assetsReq, coinsReq])
      .then(([assets, coins]) => {
        return assets.map(asset => {
          const coin = coins.find(coin => coin.id === asset.id);
          return {
            id: asset.id,
            name: asset.name,
            price: asset.priceUsd ? asset.priceUsd : 'Information Not Available',
            changePercent24Hr: asset.changePercent24Hr ? asset.changePercent24Hr : 'Information Not Available',
            logo: coin ? coin.logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png'
          };
        });
      })
      .then(data => res.send(data))
      .catch(next);
  })


  //route for coin history by ID/optional time interval
  .get('/history/:id/:interval/:start/:end', (req, res, next) => {
    const { params } = req;
    const id = params.id;
    const interval = params.interval;
    const start = params.start;
    const end = params.end;

    return request
      .get(`${BASE_URL}/assets/${id}/history?interval=${interval}${(start && end) ? `&start=${start}&end=${end}` : ''}`)
      .then(({ body }) => res.send(body.data))
      .catch(next);
  })

  
  //route to get coin by id
  .get('/:id', (req, res, next) => {
    return getCoinsById([{ name: req.params.id }])
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
        return Promise.all([
          getCoinsById(user.watchList), 
          getCoinsById(user.investedCoins),
          getCoins()
        ])
          .then(([watchList, investedCoins, top100Coins]) => {
            const data = {
              watchList: modifyWatchList(watchList, investedCoins),
              investedCoins,
              top100Coins
            };
            res.send(data);
          })
          .catch(next);
      });
  });



function modifyWatchList(watchList, investedCoins) {
  const lookup = investedCoins.reduce((acc, coin) => {
    acc = {
      ...acc,
      [coin.id]: 1 
    };
    return acc;
  }, {});

  return watchList.filter(coin => (!lookup[coin.id]));
}



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
        const coin = coins.find(coin => coin.id === asset.id);
        if(!coin) return asset;
        return {
          ...asset,
          currencySymbol: coin.logo,
          description: coin.description,
          website: coin.website
        };
      });
    });
}



function getCoinsById(array) {
  return Promise.all(
    array.map(coin => {

      if(coin.name === 'USD') {
        return {
          id: 'USD',
          currencySymbol: 'src/images/dollar.png',
          name: 'USD',
          priceUsd: '1.000000000',
          changePercent24Hr: '0'
        };
      }

      const assetReq = request
        .get(`${BASE_URL}/assets/${coin.name}`)
        .then(({ body }) => body.data);

      const coinReq = Reference
        .find({ id: coin.name })
        .lean();
      
      return Promise.all([assetReq, coinReq])
        .then(([asset, coin]) => {
          if(!coin[0]) return asset;
          coin = coin[0];
          return {
            ...asset,
            currencySymbol: coin.logo,
            description: coin.description,
            website: coin.website
          };
        });
    })
  );
}
  