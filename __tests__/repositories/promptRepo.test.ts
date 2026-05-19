jest.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { PromptRepo } from '@/repositories/promptRepo';
import { prisma } from '@/lib/prisma';

const mockPrismaPrompt = prisma.prompt as jest.Mocked<typeof prisma.prompt>;

describe('PromptRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('returns the prompt for a given user', async () => {
      const mockPrompt = { id: 1, userId: 1, prompt: 'You are a helpful assistant' };
      (mockPrismaPrompt.findUnique as jest.Mock).mockResolvedValue(mockPrompt);

      const result = await PromptRepo.findByUserId(1);

      expect(mockPrismaPrompt.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(result).toEqual(mockPrompt);
    });

    it('returns null when no prompt exists', async () => {
      (mockPrismaPrompt.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await PromptRepo.findByUserId(999);
      expect(result).toBeNull();
    });
  });

  describe('upsertPrompt', () => {
    it('upserts a prompt for a user', async () => {
      const mockPrompt = { id: 1, userId: 1, prompt: 'New prompt' };
      (mockPrismaPrompt.upsert as jest.Mock).mockResolvedValue(mockPrompt);

      const result = await PromptRepo.upsertPrompt(1, 'New prompt');

      expect(mockPrismaPrompt.upsert).toHaveBeenCalledWith({
        where: { userId: 1 },
        update: { prompt: 'New prompt' },
        create: { userId: 1, prompt: 'New prompt' },
      });
      expect(result).toEqual(mockPrompt);
    });
  });
});
