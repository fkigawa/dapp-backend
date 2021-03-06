import express from 'express';
import models from './models/userModel';
import path from 'path';
import mongoose from 'mongoose';
let User = models;
let router = express.Router();
import stripePackage from "stripe"
const stripe = stripePackage(process.env.STRIPE_KEY);
const url = require('url');

module.exports = function(passport) {
  //registration
  var validateReq = function(userData) {
    return (userData.email && userData.password && userData.passwordRepeat);
  };

  var validatePassword = function(userData) {
    return (userData.password === userData.passwordRepeat)
  };



  //creating user
  router.post('/registration', function(req, res) {
    req.body.email = req.body.email.toLowerCase();
    User.findOne({
      email: req.body.email
    }, (err, user) => {
      if(user && user.facebookInitialLogin === false) {
        return res.send('exists')
      } else if (!user) {
        stripe.customers.create({
            description: "Customer for delivery app",
            email: req.body.email,
        }, function(err,customer){
            new User({
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                stripeID: customer.id,
                facebookInitialLogin: false
            })
                .save(function(err, user) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.send(true)
                })
        });
      } else if (user && user.facebookInitialLogin === true) {
          user.password = req.body.password;
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;
          user.facebookInitialLogin = false;
          user.save(function(err, user) {
              if (err) {
                  res.send(err);
                  return;
              }
              res.send(true)
          })
      }
    })
  });

  router.post('/facebookLogin', function(req, res) {
    req.body.email = req.body.email.toLowerCase()
    User.findOne({
      email: req.body.email
    }, (err, user) => {
      if (user) {

        res.redirect(307, url.format({
          pathname:"/login",
          query: {
            "username": user.email,
            "password": user.password,
          }
        }));
      } else if (!user) {
        stripe.customers.create({
            description: "Customer for delivery app",
            email: req.body.email,
            source: "tok_amex"
        }, function(err,customer){
            new User({
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              stripeID: customer.id,
              password: req.body.id,
              facebookInitialLogin: true
            }).save(function(err, user) {
              if (err) {
                res.send(err);
                return;
              }

              res.redirect(307, url.format({
                pathname:"/login",
                query: {
                  "username": req.body.email,
                  "password": req.body.id,
                }
              }));
              // res.send(true)
            })
        });
      }
    })
  })
  //
  function usernameToLowerCase(req, res, next){
    if (req.body.username) {
      req.body.username = req.body.username.toLowerCase();
      next();
    }
    if (req.query.username) {
      req.query.username = req.query.username.toLowerCase();
      next();
    }

  }

  //login
  router.post('/login', usernameToLowerCase, passport.authenticate('local'), (req, res) => {

    res.json({
      userId: req.user._id,
      isDeliverer: req.user.isDeliverer,
      success: true,
        firstName: req.user.firstName,
        lastName: req.user.lastName
    })
  });

  //logout
  router.get('/logout', function(req, res) {
    req.logout();
    req.user = null;
    res.send(true);
  });

  return router;
}
