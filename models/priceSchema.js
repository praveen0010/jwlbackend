const mongoose = require('mongoose');
const PricesSchema = mongoose.Schema({
    golden:{
        type: String,
        required: [true, 'Please enter proper golden'],
    },
    silver:{
        type: String,
        required: [true, 'Please enter proper silver'],
    },
    chittu:{
        type: String,
        required: [true, 'Please enter proper chitu'],
    },
    createdAt: { type: Date, default: Date.now } // Default timestamp

    
});

module.exports = mongoose.model('prices', PricesSchema);
