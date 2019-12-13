module.exports = (req, res, next) => {
  if(req.headers['x-api-key'] === process.env.API_KEY) return next();
  const error = new Error('Invalid Service Key');
  error.status = 401;
  next(error);
};
