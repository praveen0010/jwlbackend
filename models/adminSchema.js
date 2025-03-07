const mongoose = require('mongoose');
const AdminSchema = mongoose.Schema({
    email:{
        type: String,
        required: [true, 'Please enter proper email'],
    },
    password:{
        type: String,
        required: [true, 'Please enter proper password'],
    },
    createdAt: { type: Date, default: Date.now } // Default timestamp

    
});

module.exports = mongoose.model('admin', AdminSchema);
