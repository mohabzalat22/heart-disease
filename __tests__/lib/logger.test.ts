import fs from 'fs';
import path from 'path';

// Mock fs module before importing logger
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

// Need to clear the module cache to get a fresh import with our mocks
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Logger', () => {
  let logger: typeof import('@/lib/logger').logger;

  beforeAll(async () => {
    const mod = await import('@/lib/logger');
    logger = mod.logger;
  });

  it('logger.info writes a JSON log line with level "info"', () => {
    logger.info('Test info message', 'meta-data');

    expect(fs.appendFileSync).toHaveBeenCalled();
    const callArgs = (fs.appendFileSync as jest.Mock).mock.calls[0];
    const logLine = callArgs[1] as string;
    const parsed = JSON.parse(logLine.trim());

    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test info message');
    expect(parsed.meta).toBe('meta-data');
    expect(parsed.time).toBeTruthy();
  });

  it('logger.warn writes a JSON log line with level "warn"', () => {
    logger.warn('Test warn message');

    expect(fs.appendFileSync).toHaveBeenCalled();
    const callArgs = (fs.appendFileSync as jest.Mock).mock.calls[0];
    const logLine = callArgs[1] as string;
    const parsed = JSON.parse(logLine.trim());

    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('Test warn message');
  });

  it('logger.error handles Error instances', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:1:1';
    logger.error(error, 'error-context');

    expect(fs.appendFileSync).toHaveBeenCalled();
    const callArgs = (fs.appendFileSync as jest.Mock).mock.calls[0];
    const logLine = callArgs[1] as string;
    const parsed = JSON.parse(logLine.trim());

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('Test error');
    const meta = JSON.parse(parsed.meta);
    expect(meta.stack).toContain('Test error');
    expect(meta.name).toBe('Error');
    expect(meta.meta).toBe('error-context');
  });

  it('logger.error handles non-Error values', () => {
    logger.error('string error', 'context');

    expect(fs.appendFileSync).toHaveBeenCalled();
    const callArgs = (fs.appendFileSync as jest.Mock).mock.calls[0];
    const logLine = callArgs[1] as string;
    const parsed = JSON.parse(logLine.trim());

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('string error');
    expect(parsed.meta).toBe('context');
  });

  it('writes to the correct log file path', () => {
    logger.info('path test');

    const callArgs = (fs.appendFileSync as jest.Mock).mock.calls[0];
    const filePath = callArgs[0] as string;
    expect(filePath).toContain(path.join('logs', 'app.log'));
  });

  describe('Directory creation', () => {
    it('creates the logs directory if it does not exist', () => {
      jest.isolateModules(() => {
        const fsMock = require('fs');
        fsMock.existsSync.mockReturnValue(false);
        require('@/lib/logger');
        expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('logs'));
      });
    });
  });
});
