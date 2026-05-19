jest.mock('@/lib/prisma', () => ({
  prisma: {
    chat: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { ChatRepository } from '@/repositories/chatRepository';
import { prisma } from '@/lib/prisma';

const mockPrismaChat = prisma.chat as jest.Mocked<typeof prisma.chat>;

describe('ChatRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockChat = {
    id: 1,
    title: 'Test Chat',
    token: 'abc123',
    userId: 1,
    isShared: false,
    sharedAt: null,
    createdAt: new Date(),
  };

  describe('create', () => {
    it('creates a chat with given data', async () => {
      (mockPrismaChat.create as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatRepository.create({
        userId: 1,
        token: 'abc123',
        title: 'Test Chat',
      });

      expect(mockPrismaChat.create).toHaveBeenCalledWith({
        data: { userId: 1, token: 'abc123', title: 'Test Chat' },
      });
      expect(result).toEqual(mockChat);
    });
  });

  describe('getAll', () => {
    it('returns all chats for a user ordered by createdAt desc', async () => {
      const chats = [mockChat];
      (mockPrismaChat.findMany as jest.Mock).mockResolvedValue(chats);

      const result = await ChatRepository.getAll(1);

      expect(mockPrismaChat.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(chats);
    });
  });

  describe('getById', () => {
    it('returns a chat by id', async () => {
      (mockPrismaChat.findUnique as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatRepository.getById(1);

      expect(mockPrismaChat.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockChat);
    });

    it('returns null when not found', async () => {
      (mockPrismaChat.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ChatRepository.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('getByToken', () => {
    it('returns a chat by token', async () => {
      (mockPrismaChat.findUnique as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatRepository.getByToken('abc123');

      expect(mockPrismaChat.findUnique).toHaveBeenCalledWith({
        where: { token: 'abc123' },
      });
      expect(result).toEqual(mockChat);
    });
  });

  describe('update', () => {
    it('updates a chat by id', async () => {
      const updated = { ...mockChat, title: 'Updated' };
      (mockPrismaChat.update as jest.Mock).mockResolvedValue(updated);

      const result = await ChatRepository.update(1, { title: 'Updated' });

      expect(mockPrismaChat.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a chat by id', async () => {
      (mockPrismaChat.delete as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatRepository.deleteById(1);

      expect(mockPrismaChat.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockChat);
    });
  });

  describe('deleteByToken', () => {
    it('deletes a chat by token', async () => {
      (mockPrismaChat.delete as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatRepository.deleteByToken('abc123');

      expect(mockPrismaChat.delete).toHaveBeenCalledWith({
        where: { token: 'abc123' },
      });
      expect(result).toEqual(mockChat);
    });
  });
});
