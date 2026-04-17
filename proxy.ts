import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export function proxy(request: NextRequest) {
  const meta = JSON.stringify({
    method: request.method,
    url: request.url,
  });

  logger.info('Incoming request', meta);
  return NextResponse.next();
}
