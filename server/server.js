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
import CartItem from './models/cartItemModel'
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
})

app.post('/createProduct', (req, res) => {
  new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl
    })
    .save(function(err, product) {
      if (err) {
        res.send(err);
        return;
      }
      res.send(true)
    })
})

app.post('/addToCart', (req, res) => {
  new CartItem({
    user: req.user._id,
    product: req.body.productId
  })
  .save(function(err, cartItem) {
    if (err) {
      res.send(err);
      return;
    }
    res.send(true)
  })
})




app.use('/', routes(passport));

http.listen(1337);
