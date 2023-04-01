const {
    deleteDeviceById,
    addDevice,
    updateDevice,
    existsDeviceWithId,
    getAllDevices,
} = require('../../models/device.model');

const DEVICE_STATUS = ["OFFLINE", "ONLINE"];

async function httpGetAllGateways(req, res) {
    const entries = await getAllDevices();
    return res.status(200).json(entries);
}

async function httpAddNewDevice(req, res) {
    const entry = req.body;

    if (entry.uid) {
        return res.status(400).json({
            error: 'Cannot provide Uid for a new device as it is an auto generated number. ',
        });
    }

    if (!entry.vendor || !entry.status) {
        return res.status(400).json({
            error: 'Missing required properties to add a new device.',
        });
    }

    if (!DEVICE_STATUS.includes(entry.status.toUpperCase())) {
        return res.status(400).json({
            error: 'Device status should be online or offline',
        });
    }

    const addedEntry = await addDevice(entry);
    return res.status(201).json(addedEntry);
}

async function httpUpdateDevice(req, res) {
    const uid = Number(req.params.id);
    const entry = req.body;

    const existsDevice = await existsDeviceWithId(uid);
    if (!existsDevice) {
        return res.status(404).json({
            error: 'Device not found for the given uid',
        });
    }

    if (entry.vendor) {
        existsDevice.vendor = entry.vendor;
    }

    if (entry.status) {
        if (!DEVICE_STATUS.includes(entry.status.toUpperCase())) {
            return res.status(400).json({
                error: 'Device status should be online or offline',
            });
        }
        existsDevice.status = entry.status.toUpperCase();
    }

    const updatedDevice = await updateDevice(existsDevice);
    return res.status(201).json(updatedDevice);
}

async function httpGetDeviceByUid(req, res) {
    const uid = Number(req.params.id);

    const existsDevice = await existsDeviceWithId(uid);
    if (!existsDevice) {
        return res.status(404).json({
            error: 'Device not found for the given uid',
        });
    }

    return res.status(201).json(existsDevice);
}

async function httpDeleteDevice(req, res) {
    const uid = Number(req.params.id);

    const existsDevice = await existsDeviceWithId(uid);
    if (!existsDevice) {
        return res.status(404).json({
            error: 'Device not found for the given uid',
        });
    }

    const deleted = await deleteDeviceById(uid);
    if (!deleted) {
        return res.status(400).json({
            error: 'Device not deleted',
        });
    }

    return res.status(200).json({
        ok: true,
    });
}

module.exports = {
    httpGetAllDevices: httpGetAllGateways,
    httpAddNewDevice,
    httpDeleteDevice,
    httpUpdateDevice,
    httpGetDeviceByUid,
};