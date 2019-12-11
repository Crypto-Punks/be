const { Router } = require('express');
const User = require('../models/User');
const Portfolio = require('../models/portfolio');
const ensureAuth = require('../middleware/ensure-auth');

// eslint-disable-next-line new-cap
module.exports = Router()
  .post('/signup', (req, res, next) => {
    const { username, password } = req.body;
    User
      .create({ username, password })
      .then(user => {
        Portfolio
          .create({ user: user._id, watchList: [], investedCoins: [{ name: 'USD', amount: 100000 }] })
          .then(() => {
            res.cookie('session', user.token(), {
              maxAge: 24 * 60 * 60 * 10000,
              httpOnly: true
            });
            res.send(user);
          });
      })
      .catch(next);
  })

  .post('/login', (req, res, next) => {
    const { username, password } = req.body;

    User
      .findOne({ username })
      .then(user => {
        if(!user || !user.compare(password)) {
          const err = new Error('Invalid username or password');
          err.status = 401;
          throw err;
        }

        res.cookie('session', user.token(), {
          maxAge: 24 * 60 * 60 * 10000,
          httpOnly: true
        });
        res.send(user);
      })
      .catch(next);
  })

  .get('/signout', (req, res) => {
    res.cookie('session', null, {
      maxAge: 0,
      httpOnly: true
    });
    res.send({ success: true });
  })

  .get('/verify', ensureAuth, (req, res) => {
    res.send(req.user);
  });
