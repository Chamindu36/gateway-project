const gatewaysDatabase = require('./gateway.mongo');

const DEFAULT_SERIAL_NUMBER = 0;

// Function to get details of a gateway
async function findGateway(filter) {
    return await gatewaysDatabase.findOne(filter,  { '_id': 0, '__v': 0 });
}

// Function to check whether a gateway is existed with the same serialNo
async function existsGatewayWithSerialNo(serialNo) {
    return await findGateway({
        serialNo,
    });
}

// Function to check whether a gateway is existed with the same name
async function existsGatewayWithName(name) {
    return await findGateway({
        name,
    });
}

// Function to get all gateways added in the system
async function getAllGateways() {
    return await gatewaysDatabase
        .find({}, { '_id': 0, '__v': 0 });
}

// Function to get the serialNo of lastly added device
async function getLatestSerialNo() {
    const latestGW = await gatewaysDatabase
        .findOne()
        .sort('-created');

    if (!latestGW) {
        return DEFAULT_SERIAL_NUMBER;
    }

    const serial = latestGW.serialNo;
    return parseInt(serial.split("-")[2]);
}

// Function to Update the existing gateway if found or add a new one if not found one
async function updateGatewayWithSerialNo(gateway) {
    const updatedOne =  await gatewaysDatabase.findOneAndUpdate({
        serialNo: gateway.serialNo,
    }, gateway, {
        new: true,
        upsert: true,
    });

    return updatedOne;
}


// Function to add a new gateway with associated devices
async function addGateway(gateway) {
    const newSerial = await getLatestSerialNo() + 1;

    const newGateway = Object.assign(gateway, {
        serialNo: `GW-000-${newSerial}`,
        created: new Date(),
    });

    return await updateGatewayWithSerialNo(newGateway);
}

// Function to delete a gateway when serial number is provided
async function deleteGatewayById(serialNo) {
    const deleted = await gatewaysDatabase.findOneAndDelete({
        serialNo,
    });

    return deleted;
}

module.exports = {
    existsGatewayWithSerialNo,
    getAllGateways,
    existsGatewayWithName,
    updateGatewayWithSerialNo,
    addGateway,
    deleteGatewayById,
}