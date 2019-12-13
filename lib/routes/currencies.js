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
    const user = req.user._id;
    Portfolio
      .find({ user })
      .select('investedCoins watchList')
      .lean()
      .then(([user]) => {
        return Promise.all([
          getCoinsById(user.watchList), 
          getCoinsById(user.investedCoins),
          getCoins()
        ]);
      })
      .then(([watchList, investedCoins, top100Coins]) => {
        const data = {
          watchList: modifyWatchList(watchList, investedCoins),
          investedCoins,
          top100Coins
        };
        res.send(data);
      })
      .catch(next);
  })
    
        

  //route to get user investments
  .get('/invested', (req, res, next) => {
    const user = req.user._id;
    Portfolio
      .find({ user })
      .select('investedCoins')
      .lean()
      .then(([user]) => {
        return Promise.all(
          user.investedCoins.map(coin => {
            if(coin.name === 'USD') {
              return {
                id: 'USD',
                logo: 'src/images/dollar.png',
                name: 'USD',
                price: '1.000000000',
              };
            }
      
            const assetReq = request
              .get(`${BASE_URL}/assets/${coin.name}`)
              .then(({ body }) => body.data);
      
            const coinReq = Reference
              .find({ id: coin.name })
              .select('logo')
              .lean();
            
            return Promise.all([assetReq, coinReq])
              .then(([asset, coin]) => {
                return {
                  id: asset.id,
                  name: asset.name,
                  price: asset.priceUsd,
                  logo: coin[0] ? coin[0].logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png',
                };
              });
          })
        );
      })
      .then(data =>res.send(data))
      .catch(next);
  })
  
  //route to get coin info by id
  .get('/info/:id', (req, res, next) => {
    const coinReq = request
      .get(`${BASE_URL}/assets/${req.params.id}`)
      .then(({ body }) => body.data);
  
    const refReq = Reference
      .find({ id: req.params.id })
      .select('logo website description')
      .lean();
        
    return Promise.all([coinReq, refReq])
      .then(([coin, refCoin]) => {
        return {
          id: coin.id,
          name: coin.name,
          price: coin.priceUsd ? coin.priceUsd : 'Information Not Available',
          supply: coin.supply ? coin.supply : 'Information Not Available',
          maxSupply: coin.maxSupply ? coin.maxSupply : 'Information Not Available',
          marketCapUsd: coin.marketCapUsd ? coin.marketCapUsd : 'Information Not Available',
          volumeUsd24Hr: coin.volumeUsd24Hr ? coin.volumeUsd24Hr : 'Information Not Available',
          changePercent24Hr: coin.changePercent24Hr ? coin.changePercent24Hr : 'Information Not Available',
          logo: refCoin[0] ? refCoin[0].logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png',
          website: refCoin[0] ? refCoin[0].website : 'Information Not Available',
          description: refCoin[0] ? refCoin[0].description : 'Information Not Available'
        };
      })
      .then(result => res.send(result))
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

  //route for coin history by id
  .get('/history/:id/:interval/:start/:end', (req, res, next) => {
    const { id, interval, start, end } = req.params;
    return request
      .get(`${BASE_URL}/assets/${id}/history?interval=${interval}&start=${start}&end=${end}`)
      .then(({ body }) => res.send(body.data))
      .catch(next);
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



function getCoins() {
  const assetsReq = request
    .get(`${BASE_URL}/assets`)
    .then(({ body }) => body.data);

  const coinsReq = Reference
    .find()
    .select('id logo')
    .lean();

  return Promise.all([assetsReq, coinsReq])
    .then(([assets, logos]) => {
      return assets.map(asset => {
        const logo = logos.find(logo => logo.id === asset.id);
        return {
          id: asset.id,
          name: asset.name,
          price: asset.priceUsd ? asset.priceUsd : 'Information Not Available',
          changePercent24Hr: asset.changePercent24Hr ? asset.changePercent24Hr : 'Information Not Available',
          logo: logo ? logo.logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png'
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
          logo: 'src/images/dollar.png',
          name: 'USD',
          price: '1.000000000',
          changePercent24Hr: '0'
        };
      }

      const assetReq = request
        .get(`${BASE_URL}/assets/${coin.name}`)
        .then(({ body }) => body.data);

      const logoReq = Reference
        .find({ id: coin.name })
        .select('logo')
        .lean();
      
      return Promise.all([assetReq, logoReq])
        .then(([asset, logo]) => {
          return {
            id: asset.id,
            name: asset.name,
            price: asset.priceUsd ? asset.priceUsd : 'Information Not Available',
            changePercent24Hr: asset.changePercent24Hr ? asset.changePercent24Hr : 'Information Not Available',
            logo: logo[0] ? logo[0].logo : 'https://reservation.asiwebres.com/v4/App_Themes/images/noimage.png'
          };
        });
    })
  );
}
  