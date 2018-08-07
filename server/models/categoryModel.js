import mongoose from 'mongoose';

var CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

module.exports =  mongoose.model('Category', CategorySchema)
