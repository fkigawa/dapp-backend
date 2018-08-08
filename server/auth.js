import express from 'express';
import models from './models/userModel';
import path from 'path';
import mongoose from 'mongoose';
let User = models;
let router = express.Router();
import stripePackage from "stripe"
const stripe = stripePackage(process.env.STRIPE_KEY);

module.exports = function(passport) {
  //registration
  var validateReq = function(userData) {
    return (userData.email && userData.password && userData.passwordRepeat);
  };

  var validatePassword = function(userData) {
    return (userData.password === userData.passwordRepeat)
  }


  //creating user
  router.post('/registration', function(req, res) {
    User.findOne({
      email: req.body.email
    }, (err, user) => {
      if(user) {
        return res.send('exists')
      } else if (!user) {
        stripe.customers.create({
            description: "Customer for delivery app",
            email: req.body.email,
            source: "tok_amex"
        }, function(err,customer){
          console.log("Customer in register is ", customer);
            new User({
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                stripeID: customer.id
            })
                .save(function(err, user) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.send(true)
                })
        });
      }
    })
  });

  //login
  router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({
      userId: req.user._id,
      success: true
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
