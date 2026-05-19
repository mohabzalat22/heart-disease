jest.mock('@/lib/prisma', () => ({
  prisma: {
    chat: { update: jest.fn(), findUnique: jest.fn() },
  },
}));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { toggleChatShare, getChatByToken } from '@/actions/share-actions';
import { prisma } from '@/lib/prisma';

describe('Share Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('toggleChatShare', () => {
    it('enables sharing', async () => {
      (prisma.chat.update as jest.Mock).mockResolvedValue({});
      const r = await toggleChatShare(1, true);
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isShared: true, sharedAt: expect.any(Date) },
      });
      expect(r).toEqual({ success: true });
    });

    it('disables sharing', async () => {
      (prisma.chat.update as jest.Mock).mockResolvedValue({});
      const r = await toggleChatShare(1, false);
      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isShared: false, sharedAt: null },
      });
      expect(r).toEqual({ success: true });
    });

    it('returns error on failure', async () => {
      (prisma.chat.update as jest.Mock).mockRejectedValue(new Error('fail'));
      const r = await toggleChatShare(1, true);
      expect(r).toEqual({ success: false, error: 'Failed to update sharing status' });
    });
  });

  describe('getChatByToken', () => {
    it('returns shared chat with messages', async () => {
      const chat = { id: 1, token: 'abc', messages: [] };
      (prisma.chat.findUnique as jest.Mock).mockResolvedValue(chat);
      const r = await getChatByToken('abc');
      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { token: 'abc', isShared: true },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      expect(r).toEqual(chat);
    });

    it('returns null on error', async () => {
      (prisma.chat.findUnique as jest.Mock).mockRejectedValue(new Error('fail'));
      const r = await getChatByToken('abc');
      expect(r).toBeNull();
    });
  });
});
