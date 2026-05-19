// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import { UserRepo } from '@/repositories/userRepo';
import { prisma } from '@/lib/prisma';

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>;

describe('UserRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('calls prisma.user.findUnique with email', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test', password: 'hash', role: 'USER', isActive: true, tokens: 1000, image: null, createdAt: new Date() };
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserRepo.findByEmail('test@test.com');

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('returns null when user not found', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserRepo.findByEmail('nonexistent@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('calls prisma.user.findUnique with id', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test' };
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await UserRepo.findById(1);

      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('creates a user with given data', async () => {
      const userData = { name: 'New User', email: 'new@test.com', password: 'hashed' };
      const createdUser = { id: 1, ...userData, role: 'USER', isActive: true, tokens: 1000 };
      (mockPrismaUser.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await UserRepo.createUser(userData);

      expect(mockPrismaUser.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('updates a user by id', async () => {
      const updateData = { name: 'Updated' };
      const updatedUser = { id: 1, name: 'Updated', email: 'test@test.com' };
      (mockPrismaUser.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserRepo.updateUser(1, updateData);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('findAll', () => {
    it('returns all users ordered by id asc', async () => {
      const users = [
        { id: 1, name: 'User1' },
        { id: 2, name: 'User2' },
      ];
      (mockPrismaUser.findMany as jest.Mock).mockResolvedValue(users);

      const result = await UserRepo.findAll();

      expect(mockPrismaUser.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('updateStatus', () => {
    it('updates the isActive field', async () => {
      const updatedUser = { id: 1, isActive: false };
      (mockPrismaUser.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await UserRepo.updateStatus(1, false);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('checkTokenBalance', () => {
    it('returns allowed:false when user not found', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await UserRepo.checkTokenBalance(999);

      expect(result).toEqual({ allowed: false, remaining: 0 });
    });

    it('returns allowed:true with null remaining for ADMIN', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
        tokens: 0,
      });

      const result = await UserRepo.checkTokenBalance(1);

      expect(result).toEqual({ allowed: true, remaining: null });
    });

    it('returns allowed:true with remaining tokens for USER with tokens', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'USER',
        tokens: 500,
      });

      const result = await UserRepo.checkTokenBalance(1);

      expect(result).toEqual({ allowed: true, remaining: 500 });
    });

    it('returns allowed:false for USER with zero tokens', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'USER',
        tokens: 0,
      });

      const result = await UserRepo.checkTokenBalance(1);

      expect(result).toEqual({ allowed: false, remaining: 0 });
    });
  });

  describe('deductTokens', () => {
    it('deducts tokens for non-ADMIN user', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'USER',
        tokens: 1000,
      });
      (mockPrismaUser.update as jest.Mock).mockResolvedValue({ tokens: 500 });

      await UserRepo.deductTokens(1, 500);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { tokens: 500 },
      });
    });

    it('does not deduct below zero', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'USER',
        tokens: 100,
      });
      (mockPrismaUser.update as jest.Mock).mockResolvedValue({ tokens: 0 });

      await UserRepo.deductTokens(1, 500);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { tokens: 0 },
      });
    });

    it('does not deduct tokens for ADMIN user', async () => {
      (mockPrismaUser.findUnique as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
        tokens: 0,
      });

      await UserRepo.deductTokens(1, 500);

      expect(mockPrismaUser.update).not.toHaveBeenCalled();
    });
  });

  describe('setTokens', () => {
    it('sets token value for a user', async () => {
      (mockPrismaUser.update as jest.Mock).mockResolvedValue({ tokens: 2000 });

      await UserRepo.setTokens(1, 2000);

      expect(mockPrismaUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { tokens: 2000 },
      });
    });
  });

  describe('refundChatToken', () => {
    it('increments token for non-ADMIN user', async () => {
      (mockPrismaUser.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await UserRepo.refundChatToken(1);

      expect(mockPrismaUser.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          role: { not: 'ADMIN' },
        },
        data: {
          tokens: { increment: 1 },
        },
      });
    });
  });
});
