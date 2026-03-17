import { prisma } from '../lib/prisma';
import type { Chat, CreateChat } from '../types/chat';

export class ChatRepository {
  static async create(data: CreateChat): Promise<Chat> {
    return prisma.chat.create({
      data,
    });
  }

  static async getAll(userId: number): Promise<Chat[]> {
    return prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { id },
    });
  }

  static async getByToken(token: string): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { token },
    });
  }

  static async update(id: number, data: Partial<Chat>): Promise<Chat> {
    return prisma.chat.update({
      where: { id },
      data,
    });
  }

  static async deleteById(id: number): Promise<Chat> {
    return prisma.chat.delete({
      where: { id },
    });
  }

  static async deleteByToken(token: string): Promise<Chat> {
    return prisma.chat.delete({
      where: { token },
    });
  }
}
