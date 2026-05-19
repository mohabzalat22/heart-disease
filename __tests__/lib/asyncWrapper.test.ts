// Mock the logger before importing asyncWrapper
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import asyncWrapper from '@/lib/utils/asyncWrapper';
import { logger } from '@/lib/logger';

describe('asyncWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the resolved value on success', async () => {
    const result = await asyncWrapper(() => Promise.resolve('hello'));
    expect(result).toBe('hello');
  });

  it('returns complex objects on success', async () => {
    const data = { id: 1, name: 'Test' };
    const result = await asyncWrapper(() => Promise.resolve(data));
    expect(result).toEqual(data);
  });

  it('returns null on error', async () => {
    const result = await asyncWrapper(() =>
      Promise.reject(new Error('fail'))
    );
    expect(result).toBeNull();
  });

  it('logs the error when the function throws', async () => {
    const error = new Error('Something went wrong');
    await asyncWrapper(() => Promise.reject(error));

    expect(logger.error).toHaveBeenCalledWith(error, 'An Error Occured');
  });

  it('handles null return from the inner function', async () => {
    const result = await asyncWrapper(() => Promise.resolve(null));
    expect(result).toBeNull();
  });

  it('handles undefined return from the inner function', async () => {
    const result = await asyncWrapper(() => Promise.resolve(undefined));
    expect(result).toBeUndefined();
  });
});
