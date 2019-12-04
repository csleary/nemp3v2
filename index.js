require('dotenv').config();
const bodyParser = require('body-parser');
const cluster = require('cluster');
const cookieSession = require('cookie-session');
const express = require('express');
const mongoose = require('mongoose');
const numCPUs = require('os').cpus().length;
const passport = require('passport');
const keys = require('./config/keys');

require('./models/Artist');
require('./models/Release');
require('./models/Sale');
require('./models/User');
require('./services/passport');

mongoose.connect(keys.mongoURI, {
  useFindAndModify: false,
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  const app = express();

  app.use(bodyParser.json());
  app.use(
    cookieSession({
      name: 'nemp3 session',
      keys: [keys.cookieKey],
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  require('./routes/artworkRoutes')(app);
  require('./routes/authRoutes')(app);
  require('./routes/downloadRoutes')(app);
  require('./routes/emailRoutes')(app);
  require('./routes/musicRoutes')(app);
  require('./routes/nemRoutes')(app);
  require('./routes/releaseRoutes')(app);
  require('./routes/trackRoutes')(app);

  const PORT = process.env.PORT || 8083;
  app.listen(PORT);
}
