jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@/repositories/messageRepository', () => ({
  MessageRepository: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  },
}));

import { MessageService } from '@/services/messageService';
import { MessageRepository } from '@/repositories/messageRepository';

describe('MessageService', () => {
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
    it('creates a message via asyncWrapper', async () => {
      (MessageRepository.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageService.create({
        chatId: 1,
        actor: 'USER' as any,
        message: 'Hello',
      });

      expect(result).toEqual(mockMessage);
    });

    it('returns null when repository throws', async () => {
      (MessageRepository.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await MessageService.create({
        chatId: 1,
        actor: 'USER' as any,
        message: 'Hello',
      });

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all messages for a chat', async () => {
      (MessageRepository.getAll as jest.Mock).mockResolvedValue([mockMessage]);

      const result = await MessageService.getAll(1);
      expect(result).toEqual([mockMessage]);
    });
  });

  describe('getById', () => {
    it('returns a message by id', async () => {
      (MessageRepository.getById as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageService.getById(1);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('update', () => {
    it('updates a message', async () => {
      const updated = { ...mockMessage, message: 'Updated' };
      (MessageRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await MessageService.update(1, { message: 'Updated' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a message by id', async () => {
      (MessageRepository.deleteById as jest.Mock).mockResolvedValue(mockMessage);

      const result = await MessageService.deleteById(1);
      expect(result).toEqual(mockMessage);
    });
  });
});
