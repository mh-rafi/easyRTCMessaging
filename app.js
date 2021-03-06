var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// Initialize mongoDB sessionstore
var MongoDBStore = require('connect-mongodb-session')(session);
var sessionStore = new MongoDBStore({
  uri: 'mongodb://rafi:hasan7234@ds039115.mlab.com:39115/mean-tarter',
  collection: 'userSessions'
});

// Initialize Mongo connections and models
var mongoose = require('mongoose');
mongoose.connect('mongodb://rafi:hasan7234@ds039115.mlab.com:39115/mean-tarter');
var models = require('./models/models.js');

// Loads passpoosrt authentication methods
var authenticate = require('./routes/authenticate')(passport);

var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(session({
  store: sessionStore,
  secret: 'session-secret'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authenticate);
app.use('/auth', authenticate);
// app.use('/', routes);
app.use('/api', api);

var passportInit = require('./passport-init');
passportInit(passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = {
  app: app,
  cookieParser: cookieParser,
  sessionStore: sessionStore
};
