import mongoose from 'mongoose';

var ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    ref: 'Category',
    type: mongoose.Schema.ObjectId,
    required: true
  },
    quantity:{
    type: Number,
        required: true
    }
});

module.exports =  mongoose.model('Product', ProductSchema)
