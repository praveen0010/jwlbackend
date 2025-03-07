const mongoose = require('mongoose');

//razorpay_order_id, razorpay_payment_id, razorpay_signature 
const PayemntSchema = mongoose.Schema({
    razorpay_order_id:{
        type: String,
        required: [true, 'Please enter proper razorpay_order_id'],
    },
    razorpay_payment_id:{
        type: String,
        required: [true, 'Please enter proper razorpay_payment_id'],
    },
    razorpay_signature:{
        type: String,
        required: [true, 'Please enter proper razorpay_signature'],
    },
    email:{
        type: String,
        required: [true, 'Please enter proper email'],
    },
    createdAt: { type: Date, default: Date.now } // Default timestamp

    
});

module.exports = mongoose.model('payment', PayemntSchema);
