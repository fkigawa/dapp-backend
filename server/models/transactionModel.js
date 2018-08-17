import mongoose from "mongoose"


let TransactionSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: {
        type: Array,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    datePurchased:{
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true
    }
});

module.exports =  mongoose.model('Transaction', TransactionSchema);
