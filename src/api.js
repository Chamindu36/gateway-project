const express = require('express');

const devicesRouter = require('./routes/devices/devices.router');
const gatewaysRouter = require('./routes/gateways/gateways.router');

const api = express.Router();


api.use('/devices', devicesRouter);
api.use('/gws', gatewaysRouter);

module.exports = api;