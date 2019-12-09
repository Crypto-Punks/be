const express = require('express');
const app = express();
const ensureAuth = require('./middleware/ensure-auth');

app.use(require('cookie-parser')());
app.use(require('cors')({
  origin: true,
  credentials: true
}));
app.use(express.json());


app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/currencies', require('./routes/currencies'));
app.use('/api/v1/portfolio', ensureAuth, require('./routes/portfolio'));
app.use('/api/v1/trade', ensureAuth, require('./routes/trade'));


app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
