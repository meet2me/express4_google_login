var express        = require('express');
var session        = require('express-session');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');
var passport       = require('passport');
var GoogleStrategy = require('passport-google').Strategy;
var app            = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'fiverr gigs' }));
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    returnURL: 'http://localhost:3000/auth/google/return',
    realm: 'http://localhost:3000/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      profile.identifier = identifier;
      console.log(profile);
      return done(null, profile);
    });
  }
));

var router = express.Router();
router.get('/', function(req, res) {
  console.log("User: "+ req.user);
  var data = req.user;
  if(data){
    res.render('account', { user: req.user });
  }
  else{
    res.render('index', { user: req.user });
  }
  // res.render('index', { user: req.user });
});
router.get('/account', ensureAuthenticated,function(req, res) {
  res.render('account', { user: req.user }); 
});
router.get('/login', function(req, res) {
  res.render('login'); 
});
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


router.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
router.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.use('/', router);


app.listen(3000);
console.log('Magic happens on port 3000');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}