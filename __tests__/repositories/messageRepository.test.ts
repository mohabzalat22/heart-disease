jest.mock('@/lib/prisma', () => ({
  prisma: {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { MessageRepository } from '@/repositories/messageRepository';
import { prisma } from '@/lib/prisma';

const mockPrismaMessage = prisma.message as jest.Mocked<typeof prisma.message>;

describe('MessageRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMessage = {
    id: 1,
    chatId: 1,
    actor: 'USER' as const,
    message: 'Hello',
    createdAt: new Date(),
  };

  describe('create', () => {
    it('creates a message', async () => {
      (mockPrismaMessage.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageRepository.create({
        chatId: 1,
        actor: 'USER' as any,
        message: 'Hello',
      });

      expect(mockPrismaMessage.create).toHaveBeenCalledWith({
        data: { chatId: 1, actor: 'USER', message: 'Hello' },
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getAll', () => {
    it('returns all messages for a chat ordered by createdAt asc', async () => {
      const messages = [mockMessage];
      (mockPrismaMessage.findMany as jest.Mock).mockResolvedValue(messages);

      const result = await MessageRepository.getAll(1);

      expect(mockPrismaMessage.findMany).toHaveBeenCalledWith({
        where: { chatId: 1 },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('getById', () => {
    it('returns a message by id', async () => {
      (mockPrismaMessage.findUnique as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageRepository.getById(1);

      expect(mockPrismaMessage.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockMessage);
    });

    it('returns null when not found', async () => {
      (mockPrismaMessage.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await MessageRepository.getById(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('updates a message by id', async () => {
      const updated = { ...mockMessage, message: 'Updated' };
      (mockPrismaMessage.update as jest.Mock).mockResolvedValue(updated);

      const result = await MessageRepository.update(1, { message: 'Updated' });

      expect(mockPrismaMessage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { message: 'Updated' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a message by id', async () => {
      (mockPrismaMessage.delete as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageRepository.deleteById(1);

      expect(mockPrismaMessage.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockMessage);
    });
  });
});
