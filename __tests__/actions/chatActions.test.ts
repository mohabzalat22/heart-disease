jest.mock('@/services/chatService', () => ({
  ChatService: {
    create: jest.fn(),
    getAll: jest.fn(),
    getByToken: jest.fn(),
    update: jest.fn(),
    deleteByToken: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import {
  createNewChat,
  updateChatTitle,
  deleteChat,
  getUserChats,
} from '@/actions/chatActions';
import { ChatService } from '@/services/chatService';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('Chat Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCookieStore = {
    get: jest.fn().mockReturnValue({ value: 'valid-token' }),
  };

  const mockUser = { userId: 1, email: 'test@test.com', name: 'Test', role: 'USER' };

  describe('createNewChat', () => {
    it('redirects to login when not authenticated', async () => {
      mockedCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) } as any);
      (verifyToken as jest.Mock).mockResolvedValue(null);
      (redirect as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });

      await expect(createNewChat()).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('creates a new chat and redirects to it', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      (ChatService.create as jest.Mock).mockResolvedValue({
        id: 1,
        token: 'new-token',
        userId: 1,
      });
      (redirect as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });

      await expect(createNewChat()).rejects.toThrow('NEXT_REDIRECT');

      expect(ChatService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          title: 'New Assessment',
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/chat');
    });
  });

  describe('updateChatTitle', () => {
    it('throws when not authenticated', async () => {
      mockedCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) } as any);
      (verifyToken as jest.Mock).mockResolvedValue(null);

      await expect(updateChatTitle('token', 'New Title')).rejects.toThrow('Unauthorized');
    });

    it('throws when chat not found or unauthorized', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      (ChatService.getByToken as jest.Mock).mockResolvedValue(null);

      await expect(updateChatTitle('token', 'New Title')).rejects.toThrow(
        'Chat not found or unauthorized'
      );
    });

    it('updates chat title when authorized', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      (ChatService.getByToken as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'token',
      });

      await updateChatTitle('token', 'New Title');

      expect(ChatService.update).toHaveBeenCalledWith(1, { title: 'New Title' });
      expect(revalidatePath).toHaveBeenCalledWith('/chat');
    });
  });

  describe('deleteChat', () => {
    it('throws when not authenticated', async () => {
      mockedCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) } as any);
      (verifyToken as jest.Mock).mockResolvedValue(null);

      await expect(deleteChat('token')).rejects.toThrow('Unauthorized');
    });

    it('throws when chat not found or unauthorized', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      (ChatService.getByToken as jest.Mock).mockResolvedValue(null);

      await expect(deleteChat('token')).rejects.toThrow(
        'Chat not found or unauthorized'
      );
    });

    it('deletes a chat when authorized', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      (ChatService.getByToken as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        token: 'token',
      });

      const result = await deleteChat('token');

      expect(ChatService.deleteByToken).toHaveBeenCalledWith('token');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUserChats', () => {
    it('throws when not authenticated', async () => {
      mockedCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) } as any);
      (verifyToken as jest.Mock).mockResolvedValue(null);

      await expect(getUserChats()).rejects.toThrow('Unauthorized');
    });

    it('returns chats for authenticated user', async () => {
      mockedCookies.mockResolvedValue(mockCookieStore as any);
      (verifyToken as jest.Mock).mockResolvedValue(mockUser);
      const chats = [{ id: 1, title: 'Chat 1' }];
      (ChatService.getAll as jest.Mock).mockResolvedValue(chats);

      const result = await getUserChats();

      expect(ChatService.getAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(chats);
    });
  });
});
