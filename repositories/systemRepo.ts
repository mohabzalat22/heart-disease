import { prisma } from '../lib/prisma';

export class SystemRepo {
  static async getDefaultPrompt() {
    const config = await prisma.systemConfig.findFirst({
      where: { id: 1 },
    });
    return config?.defaultPrompt || '';
  }

  static async updateDefaultPrompt(prompt: string) {
    return prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { defaultPrompt: prompt },
      create: { id: 1, defaultPrompt: prompt },
    });
  }
}
