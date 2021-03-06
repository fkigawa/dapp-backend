import mongoose from 'mongoose';


var UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
  },
  boughtItems: {
    type: Array,
    required: false
  },
  stripeID:{
    type: String,
    required: true
  },
  facebookInitialLogin: {
    type: Boolean,
    required: true
  },
  isDeliverer: {
    type: Boolean,
    required: false
  }
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
