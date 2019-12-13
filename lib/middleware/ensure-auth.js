const User = require('../models/User');

module.exports = (req, res, next) => {
  const session = req.cookies['session'];
  if(!session) {
    const err = new Error('Invalid session');
    err.status = 404;
    return next(err);
  }

  return User
    .findByToken(session)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(next);
};
