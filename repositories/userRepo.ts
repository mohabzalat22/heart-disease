import { prisma } from '../lib/prisma';
import { Prisma } from '../generated/prisma/client';

export class UserRepo {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  static async updateUser(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async findAll() {
    return prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }

  static async updateStatus(id: number, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  static async checkTokenBalance(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, tokens: true },
    });

    if (!user) {
      return { allowed: false, remaining: 0 };
    }

    if (user.role === 'ADMIN') {
      return { allowed: true, remaining: null as number | null };
    }

    if (user.tokens > 0) {
      return { allowed: true, remaining: user.tokens };
    }

    return { allowed: false, remaining: user.tokens };
  }

  static async deductTokens(userId: number, amount: number) {
    // Only deduct for non-ADMIN users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, tokens: true },
    });
    
    if (user && user.role !== 'ADMIN') {
      const newTokens = Math.max(0, user.tokens - amount);
      return prisma.user.update({
        where: { id: userId },
        data: {
          tokens: newTokens,
        },
      });
    }
  }

  static async setTokens(id: number, tokens: number) {
    return prisma.user.update({
      where: { id },
      data: { tokens },
    });
  }

  static async refundChatToken(userId: number) {
    return prisma.user.updateMany({
      where: {
        id: userId,
        role: { not: 'ADMIN' },
      },
      data: {
        tokens: { increment: 1 },
      },
    });
  }
}
