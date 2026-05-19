jest.mock('@/repositories/userRepo', () => ({
  UserRepo: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  signToken: jest.fn(),
}));

import { AuthService } from '@/services/authService';
import { UserRepo } from '@/repositories/userRepo';
import { hashPassword, comparePassword, signToken } from '@/lib/auth';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    password: 'hashedpassword',
    role: 'USER',
    isActive: true,
    tokens: 1000,
  };

  describe('signUp', () => {
    it('creates a new user and returns user with token', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      (UserRepo.createUser as jest.Mock).mockResolvedValue(mockUser);
      (signToken as jest.Mock).mockResolvedValue('jwt-token');

      const result = await AuthService.signUp({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(UserRepo.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(UserRepo.createUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedpassword',
      });
      expect(signToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER',
      });
      expect(result).toEqual({ user: mockUser, token: 'jwt-token' });
    });

    it('throws error when user already exists', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.signUp({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('signIn', () => {
    it('signs in a valid user and returns user with token', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (signToken as jest.Mock).mockResolvedValue('jwt-token');

      const result = await AuthService.signIn({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(UserRepo.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toEqual({ user: mockUser, token: 'jwt-token' });
    });

    it('throws error when user is not found', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.signIn({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws error when password is invalid', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.signIn({
          email: 'test@test.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws error when user account is deactivated', async () => {
      (UserRepo.findByEmail as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);

      await expect(
        AuthService.signIn({
          email: 'test@test.com',
          password: 'password123',
        })
      ).rejects.toThrow('Your account has been deactivated');
    });
  });
});
