const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {

  let status = err.status || 500;

  if(err instanceof mongoose.Error.ValidationError ||
    err instanceof mongoose.Error.CastError) {
    status = 400;
  }

  res.status(status);

  console.log(err);

  if(regExIncludesMDBErr(err.message, '.users')) {
    err.message = 'Username already taken. Please choose another.';
  }
  
  res.send({
    status,
    message: err.message
  });
};



function regExIncludesMDBErr(string, collection) {
  if(RegExp(/(^E11000)/).test(string) && string.includes(collection)) {
    return true;
  }
  return false;
}
