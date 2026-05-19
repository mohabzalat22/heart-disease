jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { proxy } from '@/proxy';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

describe('proxy', () => {
  it('logs the incoming request and returns NextResponse.next()', () => {
    const req = new NextRequest('http://localhost/api/test', { method: 'GET' });
    const res = proxy(req);
    expect(logger.info).toHaveBeenCalledWith(
      'Incoming request',
      expect.stringContaining('"method":"GET"')
    );
    expect(res).toBeDefined();
  });
});
