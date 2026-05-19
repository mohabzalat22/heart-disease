jest.mock('@/repositories/systemRepo', () => ({
  SystemRepo: {
    updateDefaultPrompt: jest.fn(),
    getDefaultPrompt: jest.fn(),
  },
}));

jest.mock('@/repositories/userRepo', () => ({
  UserRepo: {
    findById: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
    setTokens: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import {
  updateGlobalPrompt,
  getGlobalPrompt,
  getLogs,
  getAllUsers,
  toggleUserStatus,
  updateUserTokens,
} from '@/actions/adminActions';
import { SystemRepo } from '@/repositories/systemRepo';
import { UserRepo } from '@/repositories/userRepo';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('Admin Actions', () => {
  const adminUser = {
    userId: 1,
    email: 'admin@test.com',
    name: 'Admin',
    role: 'ADMIN',
  };

  const mockCookieStore = {
    get: jest.fn().mockReturnValue({ value: 'valid-token' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockedCookies.mockResolvedValue(mockCookieStore as any);
    (verifyToken as jest.Mock).mockResolvedValue(adminUser);
    (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'ADMIN' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateGlobalPrompt', () => {
    it('throws when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      await expect(updateGlobalPrompt('New prompt')).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('updates the global prompt as admin', async () => {
      (SystemRepo.updateDefaultPrompt as jest.Mock).mockResolvedValue({});

      const result = await updateGlobalPrompt('New prompt');

      expect(SystemRepo.updateDefaultPrompt).toHaveBeenCalledWith('New prompt');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getGlobalPrompt', () => {
    it('returns empty string when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      const result = await getGlobalPrompt();
      expect(result).toBe('');
    });

    it('returns the default prompt as admin', async () => {
      (SystemRepo.getDefaultPrompt as jest.Mock).mockResolvedValue('System prompt');

      const result = await getGlobalPrompt();
      expect(result).toBe('System prompt');
    });
  });

  describe('getLogs', () => {
    it('throws when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      await expect(getLogs()).rejects.toThrow('Unauthorized: Admin access required');
    });

    it('returns empty logs when log file does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await getLogs();

      expect(result).toEqual({ logs: [], total: 0, pages: 0 });

      (fs.existsSync as jest.Mock).mockRestore();
    });

    it('returns empty logs if fs.readFileSync throws', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = await getLogs();

      expect(result).toEqual({ logs: [], total: 0, pages: 0 });

      (fs.existsSync as jest.Mock).mockRestore();
      (fs.readFileSync as jest.Mock).mockRestore();
    });

    it('handles JSON parse errors in log file', async () => {
      const logLines = [
        'Invalid JSON',
        JSON.stringify({ time: '2026-01-01T00:00:00Z', level: 'info', message: 'Log 1' }),
      ].join('\n');

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(logLines);

      const result = await getLogs();
      expect(result.total).toBe(2);
      expect(result.logs[0].message).toBe('Failed to parse log line');
      expect(result.logs[1].message).toBe('Log 1');

      (fs.existsSync as jest.Mock).mockRestore();
      (fs.readFileSync as jest.Mock).mockRestore();
    });

    it('parses and paginates logs correctly', async () => {
      const logLines = [
        JSON.stringify({ time: '2026-01-01T00:00:00Z', level: 'info', message: 'Log 1' }),
        JSON.stringify({ time: '2026-01-02T00:00:00Z', level: 'error', message: 'Log 2' }),
        JSON.stringify({ time: '2026-01-03T00:00:00Z', level: 'warn', message: 'Log 3' }),
      ].join('\n');

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(logLines);

      const result = await getLogs(1, 50);

      expect(result.total).toBe(3);
      expect(result.logs).toHaveLength(3);
      // Should be sorted descending by time
      expect(result.logs[0].message).toBe('Log 3');

      (fs.existsSync as jest.Mock).mockRestore();
      (fs.readFileSync as jest.Mock).mockRestore();
    });

    it('filters logs by level', async () => {
      const logLines = [
        JSON.stringify({ time: '2026-01-01T00:00:00Z', level: 'info', message: 'Info' }),
        JSON.stringify({ time: '2026-01-02T00:00:00Z', level: 'error', message: 'Error' }),
      ].join('\n');

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(logLines);

      const result = await getLogs(1, 50, 'error');

      expect(result.total).toBe(1);
      expect(result.logs[0].level).toBe('error');

      (fs.existsSync as jest.Mock).mockRestore();
      (fs.readFileSync as jest.Mock).mockRestore();
    });

    it('filters logs by date', async () => {
      const logLines = [
        JSON.stringify({ time: '2026-01-01T00:00:00Z', level: 'info', message: 'Info 1' }),
        JSON.stringify({ time: '2026-01-02T00:00:00Z', level: 'error', message: 'Error 1' }),
      ].join('\n');

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(logLines);

      const result = await getLogs(1, 50, 'all', '2026-01-02');

      expect(result.total).toBe(1);
      expect(result.logs[0].message).toBe('Error 1');

      (fs.existsSync as jest.Mock).mockRestore();
      (fs.readFileSync as jest.Mock).mockRestore();
    });
  });

  describe('getAllUsers', () => {
    it('throws when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      await expect(getAllUsers()).rejects.toThrow('Unauthorized: Admin access required');
    });

    it('returns all users as admin', async () => {
      const users = [{ id: 1, name: 'User1' }, { id: 2, name: 'User2' }];
      (UserRepo.findAll as jest.Mock).mockResolvedValue(users);

      const result = await getAllUsers();

      expect(result).toHaveLength(2);
    });
  });

  describe('toggleUserStatus', () => {
    it('throws when not authenticated', async () => {
      mockedCookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined),
      } as any);

      await expect(toggleUserStatus(2, false)).rejects.toThrow('Unauthorized');
    });

    it('throws when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      await expect(toggleUserStatus(2, false)).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('prevents self-deactivation', async () => {
      await expect(toggleUserStatus(1, false)).rejects.toThrow(
        'You cannot deactivate your own account.'
      );
    });

    it('toggles user status as admin', async () => {
      (UserRepo.updateStatus as jest.Mock).mockResolvedValue({});

      const result = await toggleUserStatus(2, false);

      expect(UserRepo.updateStatus).toHaveBeenCalledWith(2, false);
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateUserTokens', () => {
    it('throws for negative tokens', async () => {
      await expect(updateUserTokens(2, -100)).rejects.toThrow(
        'Tokens must be a non-negative integer.'
      );
    });

    it('throws for non-integer tokens', async () => {
      await expect(updateUserTokens(2, 10.5)).rejects.toThrow(
        'Tokens must be a non-negative integer.'
      );
    });

    it('throws when target user is admin', async () => {
      (UserRepo.findById as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: 'ADMIN' }) // admin check
        .mockResolvedValueOnce({ id: 2, role: 'ADMIN' }); // target user

      await expect(updateUserTokens(2, 1000)).rejects.toThrow(
        'Admin accounts do not use tokens.'
      );
    });

    it('throws when not admin', async () => {
      (UserRepo.findById as jest.Mock).mockResolvedValue({ id: 1, role: 'USER' });

      await expect(updateUserTokens(2, 1000)).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('throws when target user is not found', async () => {
      (UserRepo.findById as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: 'ADMIN' }) // admin check
        .mockResolvedValueOnce(null); // target user

      await expect(updateUserTokens(2, 1000)).rejects.toThrow(
        'User not found.'
      );
    });

    it('updates tokens for a regular user', async () => {
      (UserRepo.findById as jest.Mock)
        .mockResolvedValueOnce({ id: 1, role: 'ADMIN' }) // admin check
        .mockResolvedValueOnce({ id: 2, role: 'USER' }); // target user
      (UserRepo.setTokens as jest.Mock).mockResolvedValue({});

      const result = await updateUserTokens(2, 5000);

      expect(UserRepo.setTokens).toHaveBeenCalledWith(2, 5000);
      expect(result).toEqual({ success: true });
    });
  });
});
