import mongoose from 'mongoose';

var CartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true
  }
});

module.exports =  mongoose.model('CartItem', CartItemSchema)
