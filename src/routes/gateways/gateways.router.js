const express = require('express');
const {
    httpGetAllGateways,
    httpAddNewGateway,
    httpDeleteGateway,
    httpUpdateGateway,
    httpGetGatewayByUid,
    httpGetGatewayByName,
} = require('./gateways.controller');

const gatewaysRouter = express.Router();

gatewaysRouter.get('/', httpGetAllGateways);
gatewaysRouter.post('/', httpAddNewGateway);
gatewaysRouter.get('/:serialNo', httpGetGatewayByUid);
gatewaysRouter.get('/:name', httpGetGatewayByName);
gatewaysRouter.delete('/:serialNo', httpDeleteGateway);
gatewaysRouter.put('/:serialNo', httpUpdateGateway);

module.exports = gatewaysRouter;