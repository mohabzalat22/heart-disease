import { prisma } from '../lib/prisma';
import type { Message, CreateMessage } from '../types/message';

export class MessageRepository {
  static async create(data: CreateMessage): Promise<Message> {
    return prisma.message.create({
      data,
    });
  }

  static async getAll(chatId: number): Promise<Message[]> {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getById(id: number): Promise<Message | null> {
    return prisma.message.findUnique({
      where: { id },
    });
  }

  static async update(id: number, data: Partial<Message>): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data,
    });
  }

  static async deleteById(id: number): Promise<Message> {
    return prisma.message.delete({
      where: { id },
    });
  }
}
