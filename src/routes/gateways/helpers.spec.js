const { validateIPAddress } = require('./helpers');

describe('validateIPAddress function', () => {
    it('should return true for valid IPv4 addresses', () => {
        expect(validateIPAddress('192.0.2.0')).toBe(true);
        expect(validateIPAddress('10.0.0.0')).toBe(true);
        expect(validateIPAddress('172.16.0.0')).toBe(true);
        expect(validateIPAddress('255.255.255.255')).toBe(true);
    });

    it('should return false for invalid IPv4 addresses', () => {
        expect(validateIPAddress('')).toBe(false);
        expect(validateIPAddress('not an IP address')).toBe(false);
        expect(validateIPAddress('300.0.0.0')).toBe(false);
        expect(validateIPAddress('255.256.255.255')).toBe(false);
        expect(validateIPAddress('255.255.255.256')).toBe(false);
        expect(validateIPAddress('255.255.255.25a')).toBe(false);
    });
});