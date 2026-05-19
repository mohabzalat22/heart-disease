jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@/repositories/chatRepository', () => ({
  ChatRepository: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    getByToken: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    deleteByToken: jest.fn(),
  },
}));

import { ChatService } from '@/services/chatService';
import { ChatRepository } from '@/repositories/chatRepository';

describe('ChatService', () => {
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
    it('creates a chat via asyncWrapper', async () => {
      (ChatRepository.create as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatService.create({
        userId: 1,
        token: 'abc123',
        title: 'Test Chat',
      });

      expect(result).toEqual(mockChat);
    });

    it('returns null when repository throws', async () => {
      (ChatRepository.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await ChatService.create({
        userId: 1,
        token: 'abc123',
      });

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all chats for a user', async () => {
      (ChatRepository.getAll as jest.Mock).mockResolvedValue([mockChat]);

      const result = await ChatService.getAll(1);
      expect(result).toEqual([mockChat]);
    });
  });

  describe('getById', () => {
    it('returns a chat by id', async () => {
      (ChatRepository.getById as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatService.getById(1);
      expect(result).toEqual(mockChat);
    });
  });

  describe('getByToken', () => {
    it('returns a chat by token', async () => {
      (ChatRepository.getByToken as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatService.getByToken('abc123');
      expect(result).toEqual(mockChat);
    });
  });

  describe('update', () => {
    it('updates a chat', async () => {
      const updated = { ...mockChat, title: 'Updated' };
      (ChatRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await ChatService.update(1, { title: 'Updated' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteById', () => {
    it('deletes a chat by id', async () => {
      (ChatRepository.deleteById as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatService.deleteById(1);
      expect(result).toEqual(mockChat);
    });
  });

  describe('deleteByToken', () => {
    it('deletes a chat by token', async () => {
      (ChatRepository.deleteByToken as jest.Mock).mockResolvedValue(mockChat);

      const result = await ChatService.deleteByToken('abc123');
      expect(result).toEqual(mockChat);
    });
  });
});
