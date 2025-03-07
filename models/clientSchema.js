const mongoose = require('mongoose');
const ClientSchema = mongoose.Schema({
    userid:{
        type: String,
        required: [true, 'Please enter user id'],
    },
    name:{
        type: String,
        required: [true, 'Please enter proper name'],
    },
    amount:{
        type: String,
        required: [true, 'Please enter amount'],
    },
    email:{
        type: String,
        required: [true, 'Please enter email'],
    },
    phone_number:{
        type: String,
        required: [true, 'Please enter phone number'],
    },
    select_type:{
        type: String,
        required: [true, 'Please enter type'],
    },
     schemes:{
        type: String,
        required: [true, 'Please enter schemes'],
    },
    paymentId:{
        type: String,
        required: [true, 'Please enter paymentId'],
    },
    paymentStatus:{
        type: String,
        required: [true, 'Please enter paymentStatus'],
    },
    createdAt: { type: Date, default: Date.now } // Default timestamp

    
});

module.exports = mongoose.model('clients', ClientSchema);
