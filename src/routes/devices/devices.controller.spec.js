const {
    httpGetAllDevices,
    httpAddNewDevice,
    httpDeleteDevice,
    httpUpdateDevice,
    httpGetDeviceByUid,
} = require('./devices.controller');

const {
    addDevice,
    deleteDeviceById,
    updateDevice,
    existsDeviceWithId,
    getAllDevices,
} = require('../../models/device.model');

jest.mock('../../models/device.model', () => ({
    addDevice: jest.fn(),
    deleteDeviceById: jest.fn(),
    updateDevice: jest.fn(),
    existsDeviceWithId: jest.fn(),
    getAllDevices: jest.fn(),
}));

describe('src/routes/devices/devices.controller', () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('httpGetAllDevices function', () => {
        it('should return all devices', async () => {
            const devices = [{uid: 1, vendor: 'Vendor 1', status: 'ONLINE'}];
            getAllDevices.mockResolvedValue(devices);

            await httpGetAllDevices(null, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(devices);
        });
    });

    describe('httpAddNewDevice function', () => {
        it('should add a new device', async () => {
            const device = {vendor: 'Vendor 1', status: 'ONLINE'};
            const addedDevice = {uid: 1, ...device};
            addDevice.mockResolvedValue(addedDevice);

            const req = {body: device};

            await httpAddNewDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(addedDevice);
        });

        it('should return error if uid is provided', async () => {
            const device = {uid: 1, vendor: 'Vendor 1', status: 'ONLINE'};
            const req = {body: device};

            await httpAddNewDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot provide Uid for a new device as it is an auto generated number. ',
            });
        });

        it('should return error if required properties are missing', async () => {
            const device = {status: 'ONLINE'};
            const req = {body: device};

            await httpAddNewDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Missing required properties to add a new device.',
            });
        });

        it('should return error if status is invalid', async () => {
            const device = {vendor: 'Vendor 1', status: 'INVALID'};
            const req = {body: device};

            await httpAddNewDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Device status should be online or offline',
            });
        });
    });

    describe('httpUpdateDevice function', () => {
        const uid = 123;
        const mockRequest = {
            params: {
                id: uid,
            },
            body: {
                vendor: 'ACME',
                status: 'ONLINE',
            },
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return 404 if device does not exist', async () => {
            existsDeviceWithId.mockResolvedValueOnce(false);

            await httpUpdateDevice(mockRequest, mockResponse);

            expect(existsDeviceWithId).toHaveBeenCalledWith(uid);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Device not found for the given uid',
            });
        });

        it('should update and return the device', async () => {
            const device = {
                uid: uid,
                vendor: 'ACME',
                status: 'OFFLINE',
            };
            existsDeviceWithId.mockResolvedValueOnce(device);
            updateDevice.mockResolvedValueOnce(device);

            await httpUpdateDevice(mockRequest, mockResponse);

            expect(existsDeviceWithId).toHaveBeenCalledWith(uid);
            expect(updateDevice).toHaveBeenCalledWith(device);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(device);
        });

        it('should return 400 if status is not valid', async () => {
            const invalidStatus = 'invalid-status';
            const invalidRequest = {
                ...mockRequest,
                body: {
                    ...mockRequest.body,
                    status: invalidStatus,
                },
            };
            existsDeviceWithId.mockResolvedValueOnce({
                uid: uid,
                vendor: 'ACME',
                status: 'OFFLINE',
            });

            await httpUpdateDevice(invalidRequest, mockResponse);

            expect(existsDeviceWithId).toHaveBeenCalledWith(uid);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Device status should be online or offline',
            });
        });
    });

    describe('httpGetDeviceByUid function', () => {
        test('should return the device with the given uid', async () => {
            const req = { params: { uid: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const existsDevice = { uid: 1, vendor: 'test vendor', status: 'ONLINE' };
            existsDeviceWithId.mockResolvedValueOnce(existsDevice);

            await httpGetDeviceByUid(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(existsDevice);
        });

        test('should return 404 if device does not exist', async () => {
            const req = { params: { uid: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            existsDeviceWithId.mockResolvedValueOnce(null);

            await httpGetDeviceByUid(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Device not found for the given uid' });
        });
    });

    describe('httpDeleteDevice function', () => {
        test('should delete the device with the given uid', async () => {
            const req = { params: { id: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const existsDevice = { uid: 1, vendor: 'test vendor', status: 'ONLINE' };
            existsDeviceWithId.mockResolvedValueOnce(existsDevice);
            deleteDeviceById.mockResolvedValueOnce(true);

            await httpDeleteDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ ok: true });
            expect(deleteDeviceById).toHaveBeenCalledWith(1);
        });

        test('should return 404 if device does not exist', async () => {
            const req = { params: { uid: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            existsDeviceWithId.mockResolvedValueOnce(null);

            await httpDeleteDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Device not found for the given uid' });
        });

        test('should return 400 if device not deleted', async () => {
            const req = { params: { id: 1 } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            const existsDevice = { uid: 1, vendor: 'test vendor', status: 'ONLINE' };
            existsDeviceWithId.mockResolvedValueOnce(existsDevice);
            deleteDeviceById.mockResolvedValueOnce(false);

            await httpDeleteDevice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Device not deleted' });
            expect(deleteDeviceById).toHaveBeenCalledWith(1);
        });
    });
});