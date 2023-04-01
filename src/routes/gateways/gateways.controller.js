const {
    existsGatewayWithSerialNo,
    getAllGateways,
    existsGatewayWithName,
    updateGatewayWithSerialNo,
    addGateway,
    deleteGatewayById,
} = require('../../models/gateway.model');

const {
    validateIPAddress
} = require('./helpers');
const devicesDatabase = require("../../models/device.mongo");


async function httpGetAllGateways(req, res) {
    const entries = await getAllGateways();
    return res.status(200).json(entries);
}

async function httpAddNewGateway(req, res) {
    const entry = req.body;

    if (entry.serialNo) {
        return res.status(400).json({
            error: 'Cannot provide Serial No for a new Gateway as it is an auto generated string. ',
        });
    }

    if (!entry.name || !entry.ipAddress) {
        return res.status(400).json({
            error: 'Missing required properties to add a new device.',
        });
    }

    if (!validateIPAddress(entry.ipAddress)) {
        return res.status(400).json({
            error: 'Device IP address is not valid. Please add valid IP address',
        });
    }

    if (!entry.associatedDevices) {
        entry.associatedDevices = [];
    } else {
        const devices = entry.associatedDevices;

        // Check whether the attached devices are added in the system
        for (const device of devices) {
            const founded = await devicesDatabase.findOne({
                uid: device,
            });

            if (!founded) {
                return res.status(404).json({
                    error: '`No matching device with id: ${device} found to attach the gateway`',
                });
            }
        }
    }

    const addedEntry = await addGateway(entry);
    return res.status(201).json(addedEntry);
}

async function httpUpdateGateway(req, res) {
    const serial = req.params.serialNo;
    const entry = req.body;

    const existsGateway = await existsGatewayWithSerialNo(serial);
    if (!existsGateway) {
        return res.status(404).json({
            error: 'Gateway not found for the given serial number',
        });
    }

    if (entry.ipAddress) {
        if(!validateIPAddress(entry.ipAddress)) {
            return res.status(400).json({
                error: 'Device IP address is not valid. Please add valid IP address',
            });
        }
        existsGateway.ipAddress = entry.ipAddress;
    }

    if (entry.associatedDevices) {
        const devices = entry.associatedDevices;

        // Check whether the attached devices are added in the system
        for (const device of devices) {
            const founded = await devicesDatabase.findOne({
                uid: device,
            });

            if (!founded) {
                return res.status(404).json({
                    error: `No matching device with id: ${device} found to attach the gateway`,
                });
            }
        }
        existsGateway.associatedDevices = entry.associatedDevices;
    }
    if (entry.name) {
        existsGateway.name = entry.name;
    }

    const updatedDevice = await updateGatewayWithSerialNo(existsGateway);
    return res.status(201).json(updatedDevice);
}

async function httpGetGatewayByUid(req, res) {
    const serial = req.params.serialNo;

    const existsGateway = await existsGatewayWithSerialNo(serial);
    if (!existsGateway) {
        return res.status(404).json({
            error: 'Gateway not found for the given serial number',
        });
    }

    return res.status(201).json(existsGateway);
}

async function httpGetGatewayByName(req, res) {
    const name = req.params.name;

    const existsGateway = await existsGatewayWithName(name);
    if (!existsGateway) {
        return res.status(404).json({
            error: 'Gateway not found for the given serial number',
        });
    }

    return res.status(201).json(existsGateway);
}

async function httpDeleteGateway(req, res) {
    const serial = req.params.serialNo;
    const existsGateway = await existsGatewayWithSerialNo(serial);
    if (!existsGateway) {
        return res.status(404).json({
            error: 'Gateway not found for the given serial number',
        });
    }

    const deleted = await deleteGatewayById(serial);
    if (!deleted) {
        return res.status(400).json({
            error: 'Gateway not deleted',
        });
    }

    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllGateways,
    httpAddNewGateway,
    httpDeleteGateway,
    httpUpdateGateway,
    httpGetGatewayByUid,
    httpGetGatewayByName,
};