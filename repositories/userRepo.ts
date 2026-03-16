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
}
