const { Router } = require('express');
const request = require('superagent');
const Reference = require('../models/Reference');
const Portfolio = require('../models/Portfolio');
const BASE_URL = 'api.coincap.io/v2';

// eslint-disable-next-line new-cap
module.exports = Router()

//route to get all coins that are in api/reference collection
  .get('/all-ids', (req, res, next) => {
    request
      .get(`${BASE_URL}/assets`)
      .query({ limit: 2000 })
      .then(({ body }) => res.send(body.data.map(coin => coin.id)))
      .catch(next);
  })

//route that gets top 100 plus user invested/watching
  .get('/100', (req, res, next) => {
    Portfolio.selectPortfolioInfo(req.user._id, 'investedCoins watchList')
      .then(([{ watchList, investedCoins }]) => {
        return Promise.all([
          getCoinsById(modifyWatchList(watchList, investedCoins)), 
          getCoinsById(investedCoins),
          getCoins()
        ]);
      })
      .then(([watchList, investedCoins, top100Coins]) => {
        res.send({ watchList, investedCoins, top100Coins });
      })
      .catch(next);
  })

//route to get user portfolio lists
  .get('/portfolio-lists', (req, res, next) => {
    Portfolio.selectPortfolioInfo(req.user._id, 'investedCoins watchList')
      .then(([user]) => {
        const modifiedWatchList = modifyWatchList(user.watchList, user.investedCoins);
        return Promise.all([
          returnCoinInfo(user.investedCoins),
          returnCoinInfo(modifiedWatchList)
        ]);
      })
      .then(data => res.send(data))
      .catch(next);
  })
  
//route to get coin info by id
  .get('/info/:id', (req, res, next) => {
    const assetReq = request
      .get(`${BASE_URL}/assets/${req.params.id}`)
      .then(({ body }) => body.data);

    return Promise.all([assetReq, Reference.refRequest('logo website description', req.params.id)])
      .then(([asset, refCoin]) => {
        res.send({
          ...returnCoin(asset, refCoin[0]),
          supply: asset.supply ? asset.supply : 'Information Not Available',
          maxSupply: asset.maxSupply ? asset.maxSupply : 'Information Not Available',
          marketCapUsd: asset.marketCapUsd ? asset.marketCapUsd : 'Information Not Available',
          volumeUsd24Hr: asset.volumeUsd24Hr ? asset.volumeUsd24Hr : 'Information Not Available',
          website: refCoin[0] ? refCoin[0].website : 'Information Not Available',
          description: refCoin[0] ? refCoin[0].description : 'Information Not Available'
        });
      })
      .catch(next);
  })

//route to get coin price by id
  .get('/price/:id', (req, res, next) => {
    if(req.params.id === 'USD') return res.send({ price: 1 });
    return request
      .get(`${BASE_URL}/assets/${req.params.id}`)
      .then(({ body }) => res.send({ price: Number(body.data.priceUsd) }))
      .catch(next);
  })

//route for user search
  .get('/search/:query', (req, res, next) => {
    const query = req.params.query;

    return request
      .get(`${BASE_URL}/assets?search=${query}`)
      .then(({ body }) => {
        const assets = body.data;
        const coinIdArray = assets.map(asset => asset.id);
        return [assets, coinIdArray];
      })
      .then(([assets, coinIdArray]) => {
        return Reference.refRequest('id logo', { $in: coinIdArray })
          .then(refCoins => {
            return assets.map(asset => {
              const coin = refCoins.find(coin => coin.id === asset.id);
              return returnCoin(asset, coin);
            });
          });
      })
      .then(data => res.send(data))
      .catch(next);
  })

//route for coin history by id
  .get('/history/:id/:interval/:start/:end', (req, res, next) => {
    const { id, interval, start, end } = req.params;
    return request
      .get(`${BASE_URL}/assets/${id}/history?interval=${interval}&start=${start}&end=${end}`)
      .then(({ body }) => res.send(body.data))
      .catch(next);
  });


function returnCoinInfo(array) {
  return Promise.all(array.map(coin => {
    if(coin.name === 'USD') return dollarObject;

    const assetReq = request
      .get(`${BASE_URL}/assets/${coin.name}`)
      .then(({ body }) => body.data);

    return Promise.all([assetReq, Reference.refRequest('logo', coin.name)])
      .then(([asset, coin]) => returnCoin(asset, coin[0]));
  }));
}


function getCoins() {
  const assetsReq = request
    .get(`${BASE_URL}/assets`)
    .then(({ body }) => body.data);

  return Promise.all([assetsReq, Reference.refRequest('id logo')])
    .then(([assets, logos]) => {
      return assets.map(asset => {
        const logo = logos.find(logo => logo.id === asset.id);
        return returnCoin(asset, logo);
      });
    });
}


function getCoinsById(array) {
  return Promise.all(
    array.map(coin => {
      if(coin.name === 'USD') return dollarObject;

      const assetReq = request
        .get(`${BASE_URL}/assets/${coin.name}`)
        .then(({ body }) => body.data);

      return Promise.all([assetReq, Reference.refRequest('logo', coin.name)])
        .then(([asset, logo]) => returnCoin(asset, logo[0]));
    })
  );
}


function modifyWatchList(watchList, investedCoins) {
  const lookup = investedCoins.reduce((acc, coin) => {
    acc = {
      ...acc,
      [coin.name]: 1 
    };
    return acc;
  }, {});

  return watchList.filter(coin => (!lookup[coin.name]));
}


const dollarObject = {
  id: 'USD',
  logo: 'https://crypto-trades-2020.herokuapp.com/images/dollar.png',
  name: 'USD',
  price: '1.000000000',
  changePercent24Hr: '0'
};


function returnCoin(asset, logo) {
  return {
    id: asset.id,
    name: asset.name,
    price: asset.priceUsd ? asset.priceUsd : 'Information Not Available',
    changePercent24Hr: asset.changePercent24Hr ? asset.changePercent24Hr : 'Information Not Available',
    logo: logo ? logo.logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png'
  };
}
