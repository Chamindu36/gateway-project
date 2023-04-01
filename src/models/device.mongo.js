const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    uid: {
        type: Number,
        required: true,
    },
    vendor: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
});

// Connects deviceSchema with the "devices" collection
module.exports = mongoose.model('Device', deviceSchema);