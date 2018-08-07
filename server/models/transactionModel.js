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
    quantity: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    datePurchased:{
        type: Date,
        required: true
    }
});

module.exports =  mongoose.model('Transaction', TransactionSchema);
