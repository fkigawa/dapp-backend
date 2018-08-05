import mongoose from 'mongoose';

var CartItemSchema = new mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: number,
    required: true
  }
});

module.exports =  mongoose.model('CartItem', CartItemSchema)
