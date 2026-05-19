import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  setAuthCookie,
  removeAuthCookie,
} from '@/lib/auth';
import { cookies } from 'next/headers';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('Auth Library', () => {
  describe('hashPassword', () => {
    it('returns a hashed string different from the original', async () => {
      const password = 'mypassword123';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash).toBeTruthy();
    });

    it('produces different hashes for the same password (due to salt)', async () => {
      const password = 'mypassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('returns true for matching password and hash', async () => {
      const password = 'mypassword123';
      const hash = await bcrypt.hash(password, 10);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('returns false for non-matching password', async () => {
      const hash = await bcrypt.hash('correctpassword', 10);
      const result = await comparePassword('wrongpassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('signToken', () => {
    it('returns a JWT string', async () => {
      const payload = {
        userId: 1,
        email: 'test@test.com',
        name: 'Test',
        role: 'USER' as const,
      };
      const token = await signToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token and returns payload', async () => {
      const payload = {
        userId: 1,
        email: 'test@test.com',
        name: 'Test',
        role: 'USER' as const,
      };
      const token = await signToken(payload);
      const result = await verifyToken(token);
      expect(result).toBeTruthy();
      expect(result!.userId).toBe(1);
      expect(result!.email).toBe('test@test.com');
    });

    it('returns null for an invalid token', async () => {
      const result = await verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('returns null for an expired token', async () => {
      const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
      const token = await new SignJWT({ userId: 1 })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // expired 1 hour ago
        .sign(SECRET_KEY);
      const result = await verifyToken(token);
      expect(result).toBeNull();
    });
  });

  describe('setAuthCookie', () => {
    it('sets the auth_token cookie with correct options', async () => {
      const mockSet = jest.fn();
      mockedCookies.mockResolvedValue({
        set: mockSet,
      } as any);

      await setAuthCookie('test-token-value');

      expect(mockSet).toHaveBeenCalledWith('auth_token', 'test-token-value', {
        httpOnly: true,
        secure: false, // NODE_ENV is 'test', not 'production'
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });
    });
  });

  describe('removeAuthCookie', () => {
    it('clears the auth_token cookie', async () => {
      const mockSet = jest.fn();
      mockedCookies.mockResolvedValue({
        set: mockSet,
      } as any);

      await removeAuthCookie();

      expect(mockSet).toHaveBeenCalledWith('auth_token', '', { maxAge: 0 });
    });
  });
});
