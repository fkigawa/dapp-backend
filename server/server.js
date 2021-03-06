import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
let app = express();
import session from 'express-session';
import routes from './auth';
import mongoose from 'mongoose';
import LocalStrategy from 'passport-local'
const Strategy = LocalStrategy.Strategy;
import passport from './passport'
var MongoStore = require('connect-mongo')(session);
import User from './models/userModel';
import Product from './models/productModel'
import Transaction from "./models/transactionModel"
import Category from './models/categoryModel'
import stripePackage from "stripe";
const stripe = stripePackage(process.env.STRIPE_KEY);

//////////////////////////

const http = require('http').Server(app);

mongoose.connection.on('connected', () =>{
  console.log('Successfully connected to MongoDB');
});

mongoose.connection.on('error', (err) =>{
  console.log('log:' + err);
  process.exit(1);
});

mongoose.connect(process.env.MONGODB_URI);

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Passport Implementation
app.use(session({
  secret: 'yer',
  store: new MongoStore({mongooseConnection: require('mongoose').connection})
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send({ express: 'Hello From Express' });
});
app.get('/user', (req, res) => {
  res.json({user: req.user})
});
app.post('/createProduct', (req, res) => {
  let categoryId;
  Category.findOne({
    name: req.body.category
  }, (err, category) => {
    new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        category: category._id,
        quantity: 0
      })
      .save(function(err, product) {
        if (err) {
          res.send(err);
          return;
        }
        res.send(true)
      })
  })
});
app.post('/checkout', (req, res) => {
    console.log("Full name ", req.body.fullName);
    console.log("Phone Number ", req.body.phoneNumber);
    console.log("");

  new Transaction({
      customer: req.user,
      products: req.body.products,
      totalAmount: req.body.amount/100,
      datePurchased: new Date(),
      address: req.body.shipping,
      phoneNumber: req.body.phoneNumber,
      fullName: req.body.fullName
  })
      .save(function(error,transaction){
          if(error){
              res.send(error)
              return;
          }
          else{
              res.json({
                  customer: req.user,
                  products: req.body.products,
                  totalAmount: req.body.amount/100,
                  datePurchased: new Date(),
                  address: req.body.shipping,
                  success: true
              });
          }
      })
});

app.post('/createCategory', (req, res) => {
  new Category({
    name: req.body.name,
    imageUrl: req.body.imageUrl
  })
  .save(function(err, category) {
    if (err) {
      res.send(err);
      return;
    }
    res.send(true)
  })
});

app.post('/createDriver', (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  User.findOne({
    email: req.body.email
  }, (err, user) => {
    if (user) {
      user.isDeliverer = true
      user.save(function(err, user) {
        if (err) {
          res.send(err);
          return;
        }
        res.send(true)
      })
    }
  })
})

app.get("/categories", (req,res)=>{
    Category.find({}, function(err,categories){
        if(err){
            res.send(err)
        }
        else{
            res.send({
                success: true,
                categories: categories
            });
        }
    })
});
app.get("/products/:category", (req,res)=>{
    let category = req.params.category;

    Category.findOne({name: category}, (err,category)=>{

        Product.find({category:category}, function(err,products){

            if(err){
                res.send(err)
            }else{
                res.send({
                    success:true,
                    products: products
                })
            }
        });
    });
});
app.get("/productDetail/:product",(req,res)=>{
    let product = req.params.product;
    Product.findOne({name:product},(err,product)=>{

        res.json({
            product: product,
            success: true
        });
    });
});
app.get("/transactions",(req,res)=>{
    Transaction.find({}, function(err,transactions){
        if(err){
            res.send(err)
        }
        else{
            res.send({
                success:true,
                transactions: transactions
            });
        }
    });
});
app.post("/payments",(req,res)=>{
    console.log("Payment Requested..");
    let token = req.body.stripeToken;
    stripe.customers.update(req.user.stripeID,{
        source: token
    },function(err,customer){
        if(err)
        {
            console.log("Error in updating customer", err);
        }

        else{

            let charge = stripe.charges.create({
                amount: req.body.amount,
                currency: "usd",
                description: `${req.body.description}`,
                customer: req.user.stripeID,
                shipping: {
                    address: {
                        line1: req.body.shippingLineOne,
                        city: req.body.city,
                        postal_code:req.body.zipCode,
                        state:req.body.state,
                    },
                    name: req.body.name
                },

            }, function(err, charge) {
                if(err) {
                    console.log("Error in creating", err);
                    res.json({error:err})
                } else {
                    stripe.customers.retrieve(req.user.stripeID, function(err,customer){
                        console.log("Customer in retrieve", customer);
                    });
                    res.send(charge)
                }
            });
        }
    });
});
app.get("/custID", (req,res)=>{
    res.json({stripeID:req.user.stripeID});
});

app.use('/', routes(passport));
http.listen(1337);
