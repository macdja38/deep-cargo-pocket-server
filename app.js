const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const PocketStrategy = require('passport-pocket');

const pocket = require('./routes/pocket');
const users = require('./routes/users');

const cors = require('cors');

const config = require('./config');

const session = require('express-session');
const RDBStore = require('session-rethinkdb');

const app = express();

app.use(cors({
  origin: config.ORIGINS,
  credentials: true,
}));

const r = require('rethinkdbdash')({
  servers: [
    config.RETHINKDB,
  ],
});

const RDBStoreSession = new RDBStore(session);

const store = new RDBStoreSession(r, {
  browserSessionsMaxAge: 60000, // optional, default is 60000 (60 seconds). Time between clearing expired sessions.
  table: 'pocketSession', // optional, default is 'session'. Table to store sessions in.
});

// Passport Set up
const pocketStrategy = new PocketStrategy({
    consumerKey: config.POCKET_CONSUMER_KEY,
    callbackURL: `${config.CLIENT_URL}/api/auth/pocket/callback`,
  }, function (username, accessToken, done) {
    console.log(username, accessToken);
    process.nextTick(function () {
      return done(null, {
        username: username,
        accessToken: accessToken,
      });
    });
  },
);

passport.use(pocketStrategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  // https://github.com/expressjs/session#options
  secret: config.SECRET,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 31, // ten seconds, for testing
  },
  store: store,
  resave: true,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',
  passport.authenticate('pocket'),
  function (req, res) {
    console.log("authentication successful");
    console.log(req);
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect(config.CLIENT_URL);
  });

app.get('/auth/pocket/callback', passport.authenticate('pocket', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect(config.CLIENT_URL);
  });

app.use('/home', (req, res, done) => {
  console.log(res.user);
  res.send("hi");
});
app.use('/pocket', pocket);
app.use('/user', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.error(err);
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;
