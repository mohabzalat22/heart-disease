jest.mock('@/repositories/userRepo', () => ({
  UserRepo: { updateUser: jest.fn() },
}));
jest.mock('@/repositories/promptRepo', () => ({
  PromptRepo: { upsertPrompt: jest.fn() },
}));
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
  signToken: jest.fn(),
  setAuthCookie: jest.fn(),
}));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import { updateProfile, updateSystemPrompt } from '@/actions/settingsActions';
import { UserRepo } from '@/repositories/userRepo';
import { PromptRepo } from '@/repositories/promptRepo';
import { verifyToken, signToken, setAuthCookie } from '@/lib/auth';
import { cookies } from 'next/headers';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

function fd(data: Record<string, string>): FormData {
  const f = new FormData();
  Object.entries(data).forEach(([k, v]) => f.append(k, v));
  return f;
}

describe('Settings Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'tok' }),
    } as any);
    (verifyToken as jest.Mock).mockResolvedValue({
      userId: 1, email: 't@t.com', name: 'T', role: 'USER',
    });
  });

  describe('updateProfile', () => {
    it('returns not authenticated when no user', async () => {
      (verifyToken as jest.Mock).mockResolvedValue(null);
      const r = await updateProfile(null, fd({ name: 'T', email: 't@t.com' }));
      expect(r?.message).toBe('Not authenticated');
    });

    it('returns validation errors for invalid data', async () => {
      const r = await updateProfile(null, fd({ name: 'A', email: 'bad' }));
      expect(r?.errors).toBeDefined();
    });

    it('updates profile and refreshes token', async () => {
      (UserRepo.updateUser as jest.Mock).mockResolvedValue({
        id: 1, email: 'n@t.com', name: 'New', role: 'USER',
      });
      (signToken as jest.Mock).mockResolvedValue('new-tok');
      const r = await updateProfile(null, fd({ name: 'New', email: 'n@t.com' }));
      expect(setAuthCookie).toHaveBeenCalledWith('new-tok');
      expect(r?.message).toBe('Profile updated successfully');
    });

    it('returns unknown error message on non-Error object', async () => {
      (UserRepo.updateUser as jest.Mock).mockRejectedValue('String error');
      const r = await updateProfile(null, fd({ name: 'New', email: 'n@t.com' }));
      expect(r?.message).toBe('An unknown error occurred');
    });
  });

  describe('updateSystemPrompt', () => {
    it('returns not authenticated when no user', async () => {
      (verifyToken as jest.Mock).mockResolvedValue(null);
      const r = await updateSystemPrompt(null, fd({ prompt: 'p' }));
      expect(r?.message).toBe('Not authenticated');
    });

    it('upserts prompt on success', async () => {
      (PromptRepo.upsertPrompt as jest.Mock).mockResolvedValue({});
      const r = await updateSystemPrompt(null, fd({ prompt: 'Be helpful' }));
      expect(PromptRepo.upsertPrompt).toHaveBeenCalledWith(1, 'Be helpful');
      expect(r?.message).toBe('System prompt updated successfully');
    });

    it('returns validation errors for invalid data', async () => {
      const r = await updateSystemPrompt(null, fd({ prompt: '' }));
      expect(r?.errors).toBeDefined();
    });

    it('returns unknown error message on non-Error object', async () => {
      (PromptRepo.upsertPrompt as jest.Mock).mockRejectedValue('String error');
      const r = await updateSystemPrompt(null, fd({ prompt: 'Be helpful' }));
      expect(r?.message).toBe('An unknown error occurred');
    });
  });
});
