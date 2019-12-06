const { Router } = require('express');
const User = require('../model/User');
const ensureAuth = require('../middleware/ensure-auth');

module.exports = Router()
  .post('/signup', (req, res, next) => {
    const { username, password } = req.body;
    User
      .create({ username, password })
      .then(user => {
        res.cookie('session', user.token(), {
          maxAge: 24 * 60 * 60 * 10000,
          httpOnly: true
        });
        res.send(user);
      })
      .catch(next);
  })

  .post('/signin', (req, res, next) => {
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
