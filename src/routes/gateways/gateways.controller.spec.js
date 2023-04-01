const sinon = require('sinon');

const {
    httpGetAllGateways,
    httpAddNewGateway,
    httpUpdateGateway,
    httpGetGatewayByUid,
    httpGetGatewayByName,
    httpDeleteGateway,
} = require('./gateways.controller');

const {
    getAllGateways,
    existsGatewayWithSerialNo,
    existsGatewayWithName,
    updateGatewayWithSerialNo,
    addGateway,
    deleteGatewayById,
} = require('../../models/gateway.model');

const { validateIPAddress } = require('./helpers');

const devicesDatabase = require('../../models/device.mongo');

jest.mock('../../models/gateway.model');
jest.mock('../../models/device.mongo');
jest.mock('../../models/device.model');
jest.mock('./helpers', () => ({
    validateIPAddress: jest.fn(),
}));

describe('src/routes/gateways/gateways.controller', () => {

    describe('httpGetAllGateways function', () => {
        test('should return all gateways', async () => {
            const entries = [
                {
                    serialNo: "GW-000-1",
                    name: "Default-1",
                    ipAddress: "127.0.0.67",
                    associatedDevices: [],
                    created: "2023-04-01T20:02:02.640Z"
                },
                {
                    serialNo: "GW-000-2",
                    name: "Default-2",
                    ipAddress: "111.0.0.67",
                    associatedDevices: [],
                    created: "2023-04-01T20:02:02.640Z"
                }];
            getAllGateways.mockResolvedValueOnce(entries);

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            };

            await httpGetAllGateways(req, res);

            expect(getAllGateways).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(entries);
        });
    });

    describe('httpAddNewGateway function', () => {
        let req, res;

        beforeEach(() => {
            req = {
                body: {
                    name: 'Gateway 1',
                    ipAddress: '127.0.1.1',
                    associatedDevices: [1, 2],
                },
            };

            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            validateIPAddress.mockReturnValue(true);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('should return 400 status code and error message if entry has serialNo', async () => {
            const reqWithSerialNo = {
                body: {
                    ...req.body,
                    serialNo: 'GW-000-1',
                },
            };

            await httpAddNewGateway(reqWithSerialNo, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot provide Serial No for a new Gateway as it is an auto generated string. ',
            });
        });

        test('should return 400 status code and error message if entry is missing name or ipAddress', async () => {
            const reqWithoutName = {
                body: {
                    ...req.body,
                    name: undefined,
                },
            };

            const reqWithoutIpAddress = {
                body: {
                    ...req.body,
                    ipAddress: undefined,
                },
            };

            await httpAddNewGateway(reqWithoutName, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Missing required properties to add a new device.',
            });

            await httpAddNewGateway(reqWithoutIpAddress, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Missing required properties to add a new device.',
            });
        });

        test('should return 400 status code and error message if ipAddress is invalid', async () => {
            const reqWithInvalidIpAddress = {
                body: {
                    ...req.body,
                    ipAddress: 'not-an-ip-address',
                },
            };
            validateIPAddress.mockReturnValue(false);

            await httpAddNewGateway(reqWithInvalidIpAddress, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Device IP address is not valid. Please add valid IP address',
            });
        });

        test('should return 404 status code and error message if any attached devices are not found', async () => {
            const devicesDatabase = {
                findOne: jest.fn().mockReturnValueOnce(null).mockReturnValueOnce({}),
            };

            const addGateway = jest.fn();

            const reqWithMissingDevice = {
                body: {
                    ...req.body,
                    ipAddress: '127.0.1.1',
                    associatedDevices: [2, 4],
                },
            };

            await httpAddNewGateway(reqWithMissingDevice, res, devicesDatabase, addGateway);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: '`No matching device with id: ${device} found to attach the gateway`',
            });
        });

        test('Adding new gateway with empty associatedDevices array', async () => {
            const req = {
                body: {
                    name: 'Gateway 2',
                    ipAddress: '127.0.0.67',
                    associatedDevices: [],
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await httpAddNewGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('Adding new gateway with undefined associatedDevices property', async () => {
            const req = {
                body: {
                    name: 'Gateway 3',
                    ipAddress: '127.0.0.67',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await httpAddNewGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('httpUpdateGateway function', () => {
        let req;
        let res;

        beforeEach(() => {
            req = {
                params: {serialNo: 'GW-000-1'},
                body: {},
            };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should return 404 error if gateway is not found for the given serial number', async () => {
            existsGatewayWithSerialNo.mockResolvedValue(false);

            await httpUpdateGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Gateway not found for the given serial number',
            });
        });

        test('should return 400 status code with error message when ipAddress is invalid', async () => {
            const req = {
                params: {
                    serialNo: 'GW-000-1',
                },
                body: {
                    ipAddress: 'invalid-ip-address',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            existsGatewayWithSerialNo.mockResolvedValueOnce(true);
            validateIPAddress.mockReturnValueOnce(false);

            await httpUpdateGateway(req, res);

            expect(existsGatewayWithSerialNo).toHaveBeenCalledWith(req.params.serialNo);
            expect(validateIPAddress).toHaveBeenCalledWith(req.body.ipAddress);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Device IP address is not valid. Please add valid IP address'});
        });

        test('should update ipAddress when ipAddress is valid', async () => {
            const req = {
                params: {
                    serialNo: 'GW-000-1',
                },
                body: {
                    ipAddress: '192.168.1.100',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            existsGatewayWithSerialNo.mockResolvedValueOnce({ipAddress: '192.168.1.1'});
            validateIPAddress.mockReturnValueOnce(true);
            updateGatewayWithSerialNo.mockResolvedValueOnce({ipAddress: '192.168.1.100'});

            await httpUpdateGateway(req, res);

            expect(existsGatewayWithSerialNo).toHaveBeenCalledWith(req.params.serialNo);
            expect(validateIPAddress).toHaveBeenCalledWith(req.body.ipAddress);
            expect(updateGatewayWithSerialNo).toHaveBeenCalledWith({ipAddress: '192.168.1.100'});
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ipAddress: '192.168.1.100'});
        });

        test('should not update ipAddress when it is not provided', async () => {
            const req = {
                params: {
                    serialNo: 'GW-000-1',
                },
                body: {
                    name: 'Gateway 1',
                    associatedDevices: [1, 2],
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            existsGatewayWithSerialNo.mockResolvedValueOnce({ipAddress: '192.168.1.1'});

            await httpUpdateGateway(req, res);

            expect(existsGatewayWithSerialNo).toHaveBeenCalledWith(req.params.serialNo);
            expect(validateIPAddress).not.toHaveBeenCalled();
        });

        it('should return 404 if any of the associated devices are not found', async () => {
            existsGatewayWithSerialNo.mockResolvedValue({
                associatedDevices: [1, 2],
            });
            devicesDatabase.findOne.mockResolvedValueOnce(null);

            req.body.associatedDevices = [3];

            await httpUpdateGateway(req, res);

            expect(devicesDatabase.findOne).toHaveBeenCalledWith({uid: 3});
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No matching device with id: 3 found to attach the gateway',
            });
        });
    });

    describe('httpGetGatewayByUid function', () => {
        const mockRequest = {
            params: {
                serialNo: 'GW-000-1'
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('should return a 404 error if the gateway does not exist', async () => {
            existsGatewayWithSerialNo.mockResolvedValueOnce(null);

            await httpGetGatewayByUid(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Gateway not found for the given serial number',
            });
        });

        test('should return the gateway with a 201 status if it exists', async () => {
            const gateway = {serialNo: 'GW-000-1', name: 'Gateway 1', ipAddress: '192.168.0.1'};
            existsGatewayWithSerialNo.mockResolvedValueOnce(gateway);

            await httpGetGatewayByUid(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(gateway);
        });
    });

    describe('httpGetGatewayByName function', () => {
        const mockReq = {
            params: {
                name: 'Gateway 1',
            },
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should return 404 error if gateway does not exist', async () => {
            existsGatewayWithName.mockResolvedValueOnce(false);

            await httpGetGatewayByName(mockReq, mockRes);

            expect(existsGatewayWithName).toHaveBeenCalledWith(mockReq.params.name);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Gateway not found for the given serial number',
            });
        });

        test('should return the gateway object with a 201 status code', async () => {
            const mockGateway = {
                serialNo: 'GW-000-6',
                name: 'Gateway 1',
                associatedDevices: [1, 2, 3],
            };
            existsGatewayWithName.mockResolvedValueOnce(mockGateway);

            await httpGetGatewayByName(mockReq, mockRes);

            expect(existsGatewayWithName).toHaveBeenCalledWith(mockReq.params.name);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockGateway);
        });
    });

    describe('httpDeleteGateway function', () => {
        const req = {
            params: {
                serialNo: 'GW-000-6',
            },
        };
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res),
        };

        beforeEach(() => {
            res.status.mockClear();
            res.json.mockClear();
        });

        test('should delete gateway with valid serial number', async () => {
            existsGatewayWithSerialNo.mockResolvedValueOnce(true);
            deleteGatewayById.mockResolvedValueOnce(true);

            await httpDeleteGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ok: true});
        });

        test('should return 404 if gateway does not exist', async () => {
            existsGatewayWithSerialNo.mockResolvedValueOnce(false);

            await httpDeleteGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Gateway not found for the given serial number',
            });
        });

        test('should return 400 if gateway not deleted', async () => {
            existsGatewayWithSerialNo.mockResolvedValueOnce(true);
            deleteGatewayById.mockResolvedValueOnce(false);

            await httpDeleteGateway(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Gateway not deleted',
            });
        });
    });
});