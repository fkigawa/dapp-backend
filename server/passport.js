import passport from 'passport';
import LocalStrategy from 'passport-local';
const Strategy = LocalStrategy.Strategy;
import models from './models/userModel'
let User = models;

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new Strategy(function(email, password, done) {
  console.log( 'we out here ', email)
  User.findOne({ email: email, password: password }, function (err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.log(err);
      return done(err);
    }
    // if no user present, auth failed
    if (!user) {
      console.log(user);
      return done(null, false);
    }
    // auth has has succeeded
    return done(null, user);
  });
}));

export default passport;
