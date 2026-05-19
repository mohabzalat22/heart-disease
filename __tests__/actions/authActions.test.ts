jest.mock('@/services/authService', () => ({
  AuthService: {
    signUp: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

import { handleSignUp, handleSignIn, handleSignOut } from '@/actions/authActions';
import { AuthService } from '@/services/authService';
import { setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function createFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => fd.append(key, value));
    return fd;
  }

  describe('handleSignUp', () => {
    it('returns validation errors for invalid data', async () => {
      const formData = createFormData({
        name: 'A', // too short
        email: 'invalid-email',
        password: '123', // too short
      });

      const result = await handleSignUp(null, formData);

      expect(result?.errors).toBeDefined();
      expect(result?.errors?.name).toBeDefined();
      expect(result?.errors?.email).toBeDefined();
      expect(result?.errors?.password).toBeDefined();
    });

    it('calls AuthService.signUp and sets cookie on success', async () => {
      (AuthService.signUp as jest.Mock).mockResolvedValue({ token: 'jwt-token' });

      const formData = createFormData({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      // redirect throws in Next.js, simulate that
      (redirect as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      await expect(handleSignUp(null, formData)).rejects.toThrow('NEXT_REDIRECT');

      expect(AuthService.signUp).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });
      expect(setAuthCookie).toHaveBeenCalledWith('jwt-token');
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('returns error message when AuthService throws', async () => {
      (AuthService.signUp as jest.Mock).mockRejectedValue(
        new Error('User already exists')
      );

      const formData = createFormData({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      const result = await handleSignUp(null, formData);

      expect(result?.message).toBe('User already exists');
    });

    it('returns unknown error message when AuthService throws non-Error object', async () => {
      (AuthService.signUp as jest.Mock).mockRejectedValue('String error');

      const formData = createFormData({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      const result = await handleSignUp(null, formData);

      expect(result?.message).toBe('An unknown error occurred');
    });
  });

  describe('handleSignIn', () => {
    it('returns validation errors for invalid data', async () => {
      const formData = createFormData({
        email: 'bad',
        password: '12',
      });

      const result = await handleSignIn(null, formData);

      expect(result?.errors).toBeDefined();
    });

    it('calls AuthService.signIn and sets cookie on success', async () => {
      (AuthService.signIn as jest.Mock).mockResolvedValue({ token: 'jwt-token' });

      const formData = createFormData({
        email: 'test@test.com',
        password: 'password123',
      });

      (redirect as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      await expect(handleSignIn(null, formData)).rejects.toThrow('NEXT_REDIRECT');

      expect(AuthService.signIn).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(setAuthCookie).toHaveBeenCalledWith('jwt-token');
    });

    it('returns error message when AuthService throws', async () => {
      (AuthService.signIn as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const formData = createFormData({
        email: 'test@test.com',
        password: 'password123',
      });

      const result = await handleSignIn(null, formData);

      expect(result?.message).toBe('Invalid credentials');
    });

    it('returns unknown error message when AuthService throws non-Error object', async () => {
      (AuthService.signIn as jest.Mock).mockRejectedValue('String error');

      const formData = createFormData({
        email: 'test@test.com',
        password: 'password123',
      });

      const result = await handleSignIn(null, formData);

      expect(result?.message).toBe('An unknown error occurred');
    });
  });

  describe('handleSignOut', () => {
    it('removes auth cookie and redirects to login', async () => {
      (redirect as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT');
      });

      await expect(handleSignOut()).rejects.toThrow('NEXT_REDIRECT');

      expect(removeAuthCookie).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
