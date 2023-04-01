const devicesDatabase = require('./device.mongo');

const DEFAULT_UID_NUMBER = 0;

async function findDevice(filter) {
    return await devicesDatabase.findOne(filter,  { '_id': 0, '__v': 0 });
}

// Function to check whether a device is existed with the same serialNo
async function existsDeviceWithId(uid) {
    return await findDevice(
    {uid},
    );
}

// Function to get all devices added in the system with the sorted order
async function getAllDevices() {
    return await devicesDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({ uid: 1 });
}

// Function to Update the existing device if found or add a new one if not found one
async function updateDevice(device) {
    const updatedOne =  await devicesDatabase.findOneAndUpdate({
        uid: device.uid,
    }, device, {
        upsert: true,
        new: true,
    });

    return updatedOne;
}

// Function to get the uid of lastly added device
async function getLatestUid() {
    const latestDevice = await devicesDatabase
        .findOne()
        .sort('-uid');

    if (!latestDevice) {
        return DEFAULT_UID_NUMBER;
    }

    return latestDevice.uid;
}

// Function to add a new device
async function addDevice(device) {
    const newUid = await getLatestUid() + 1;

    const newDevice = Object.assign(device, {
        uid: newUid,
        dateCreated: new Date(),
        status: device.status.toUpperCase(),
    });

    const addedOne =  await updateDevice(newDevice);
    return addedOne;
}

// Function to delete a device when uid is provided
async function deleteDeviceById(uid) {
    const deleted = await devicesDatabase.findOneAndDelete({
        uid,
    });

    return deleted;
}

module.exports = {
    deleteDeviceById,
    addDevice,
    updateDevice,
    existsDeviceWithId,
    getAllDevices,
}