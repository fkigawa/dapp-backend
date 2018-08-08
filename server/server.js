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
const stripe = stripePackage("sk_test_lvRIg4KqKKsnzG3SOOWTHtd9");

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
        category: category._id
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
    let productNames = [];
    let trackingProducts = [];
    let totalQuantity = req.body.cartItems.length;
    let total = 0;
    let productItem = "";
    console.log("User ID", req.user);
    req.body.cartItems.map((item)=>{
        productNames.map((productDetail,i)=> {
            if(String(Object.keys(productDetail)) === item.name){
                let count = productNames[i][item.name];
                productNames[i][item.name] = ++count;
                trackingProducts.push(item.name);
            }
        });

        if(trackingProducts.indexOf(item.name)===-1){
            productItem = item.name;
            productNames.push({[productItem]:1});
        }
        total+= parseFloat(item.price);
    });
  new Transaction({
    customer: req.user,
      products: productNames,
      quantity: totalQuantity,
      totalAmount: total,
      datePurchased: new Date()
  })
      .save(function(error,transaction){
          if(error){
              res.send(error)
              return;
          }
          else{
              res.send({
                  customer: req.user,
                  products: productNames,
                  quantity: totalQuantity,
                  totalAmount: total,
                  datePurchased: new Date(),
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
    console.log("Category found", category );
    Category.findOne({name: category}, (err,category)=>{
        console.log("Category in product", category);
        Product.find({category:category}, function(err,products){
            console.log("Products", products);
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
    console.log("Payment Requested..", req.body);
    let token = req.body.stripeToken;
    let charge = stripe.charges.create({
        amount: 444,
        currency: "usd",
        description: "test charge",
        source: token,
    }, function(err, charge) {
        if(err) {
            console.log(err);
            res.send('Failed')
        } else {
            console.log('success payment', charge);
            res.send(charge)
        }
    });
});
app.use('/', routes(passport));
http.listen(1337);
