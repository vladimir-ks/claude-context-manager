/**
 * Jest Test Setup
 *
 * Runs before all tests
 *
 * Author: Vladimir K.S.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CCM_DEBUG = 'false';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };
