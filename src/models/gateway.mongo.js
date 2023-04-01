const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema({
    serialNo: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    associatedDevices: {
        type: Array(Number),
        required: false,
    },
    created: {
        type: Date,
        required: true,
    }
});

// Connects gatewaySchema with the "gateways" collection
module.exports = mongoose.model('Gateway', gatewaySchema);