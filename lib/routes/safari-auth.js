const { Router } = require('express');
const User = require('../models/user');
const tokenService = require('../token-service');
const ensureAuth = require('../middleware/ensure-auth');

const getCredentials = body => {
  const { username, password } = body;
  delete body.password;
  return { username, password };
};

const sendUser = (res, user) => {
  return tokenService.sign(user)
    .then(token => res.json({ 
      _id: user._id,
      username: user.username,
      token: token 
    })
    );
};

const checkCredentialsExist = (username, password) => {
  if(!username || !password) {
    return Promise.reject({
      statusCode: 400,
      error: 'username and password required'
    });
  }
  return Promise.resolve();
};



// eslint-disable-next-line new-cap
module.exports = Router()

  .get('/verify', ensureAuth(), (req, res) => {
    res.json({ verified: true });
  })

  

  .post('/signup', ({ body }, res, next) => {
    const { username, password } = getCredentials(body);
    
    checkCredentialsExist(username, password)
      .then(() => {
        return User.exists({ username });
      }) 
      .then(exists => {
        if(exists) {
          throw {
            statusCode: 400,
            error: 'username already in use'
          };
        }
        
        body.roles = [];
        const user = new User(body);
        user.generateHash(password);
        return user.save();
      })
      .then(user => sendUser(res, user))
      .catch(next);

  })



  .post('/login', ({ body }, res, next) => {
    const { username, password } = getCredentials(body);

    checkCredentialsExist(username, password)
      .then(() => {
        return User.findOne({ username });
      })
      .then(user => {
        if(!user || !user.comparePassword(password)) {
          throw {
            statusCode: 401,
            error: 'Invalid username or password'
          };
        }
        return sendUser(res, user);
      })   
      .catch(next);
  });

  // .use('/users', ensureAuth(), ensureRole('admin'), authUser);
