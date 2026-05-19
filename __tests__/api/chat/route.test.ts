jest.mock('@/services/aiService', () => ({
  AIService: { respond: jest.fn(), saveResponse: jest.fn() },
}));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    chat: { create: jest.fn(), findUnique: jest.fn() },
  },
}));
jest.mock('@/services/messageService', () => ({
  MessageService: { create: jest.fn() },
}));
jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/repositories/userRepo', () => ({
  UserRepo: { checkTokenBalance: jest.fn() },
}));
jest.mock('@/generated/prisma', () => ({ Actor: { USER: 'USER', ASSISTANT: 'ASSISTANT' } }));

import { POST } from '@/app/api/chat/route';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRepo } from '@/repositories/userRepo';
import { MessageService } from '@/services/messageService';
import { AIService } from '@/services/aiService';
import { prisma } from '@/lib/prisma';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'tok' }),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (verifyToken as jest.Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId: 1, message: 'hi' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 402 when no tokens', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({
      allowed: false, remaining: 0,
    });
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId: 1, message: 'hi' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });

  it('creates a new chat when chatId is 0', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: 1000 });
    (prisma.chat.create as jest.Mock).mockResolvedValue({ id: 5, token: 'new-tok' });
    (MessageService.create as jest.Mock).mockResolvedValue({ id: 1 });

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    (AIService.respond as jest.Mock).mockResolvedValue(mockStream);

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId: 0, message: 'hello' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.chat.create).toHaveBeenCalled();
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('returns 500 when message save fails', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: 1000 });
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({ id: 1, token: 'tok' });
    (MessageService.create as jest.Mock).mockResolvedValue(null);

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId: 1, message: 'hi' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('returns 500 when an exception is thrown', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    const req = {
      json: jest.fn().mockRejectedValue(new Error('Bad JSON')),
    } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('handles stream chunks correctly and saves response', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: 1000 });
    (prisma.chat.findUnique as jest.Mock).mockResolvedValue({ id: 1, token: 'tok' });
    (MessageService.create as jest.Mock).mockResolvedValue({ id: 1 });

    const chunks = [
      'data: {"content":"Hello"}\n',
      'data: {"content":" World"}\n',
      'data: invalid-json\n', // Should be caught by try/catch
      'data: [DONE]\n\n',
    ];

    const mockStream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(new TextEncoder().encode(chunk)));
        controller.close();
      },
    });

    (AIService.respond as jest.Mock).mockResolvedValue(mockStream);

    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId: 1, message: 'hello' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Consume the stream to trigger the transform and flush
    const reader = res.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    expect(AIService.saveResponse).toHaveBeenCalledWith(1, 'Hello World');
  });
});
