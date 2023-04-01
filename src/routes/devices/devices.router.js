const express = require('express');
const {
    httpGetAllDevices,
    httpAddNewDevice,
    httpDeleteDevice,
    httpUpdateDevice,
    httpGetDeviceByUid,
} = require('./devices.controller');

const devicesRouter = express.Router();

devicesRouter.get('/', httpGetAllDevices);
devicesRouter.post('/', httpAddNewDevice);
devicesRouter.get('/:id', httpGetDeviceByUid);
devicesRouter.delete('/:id', httpDeleteDevice);
devicesRouter.put('/:id', httpUpdateDevice);

module.exports = devicesRouter;