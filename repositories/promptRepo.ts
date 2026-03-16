import { prisma } from '../lib/prisma';

export class PromptRepo {
  static async findByUserId(userId: number) {
    return prisma.prompt.findUnique({
      where: { userId },
    });
  }

  static async upsertPrompt(userId: number, prompt: string) {
    return prisma.prompt.upsert({
      where: { userId },
      update: { prompt },
      create: { userId, prompt },
    });
  }
}
