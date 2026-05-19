jest.mock('@/lib/prisma', () => ({
  prisma: {
    systemConfig: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { SystemRepo } from '@/repositories/systemRepo';
import { prisma } from '@/lib/prisma';

const mockPrismaSystemConfig = prisma.systemConfig as jest.Mocked<typeof prisma.systemConfig>;

describe('SystemRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultPrompt', () => {
    it('returns the default prompt when config exists', async () => {
      (mockPrismaSystemConfig.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        defaultPrompt: 'You are a health assistant',
      });

      const result = await SystemRepo.getDefaultPrompt();

      expect(mockPrismaSystemConfig.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe('You are a health assistant');
    });

    it('returns empty string when config does not exist', async () => {
      (mockPrismaSystemConfig.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await SystemRepo.getDefaultPrompt();
      expect(result).toBe('');
    });

    it('returns empty string when defaultPrompt is null', async () => {
      (mockPrismaSystemConfig.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        defaultPrompt: null,
      });

      const result = await SystemRepo.getDefaultPrompt();
      expect(result).toBe('');
    });
  });

  describe('updateDefaultPrompt', () => {
    it('upserts the system config with the new prompt', async () => {
      const mockConfig = { id: 1, defaultPrompt: 'Updated prompt' };
      (mockPrismaSystemConfig.upsert as jest.Mock).mockResolvedValue(mockConfig);

      const result = await SystemRepo.updateDefaultPrompt('Updated prompt');

      expect(mockPrismaSystemConfig.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: { defaultPrompt: 'Updated prompt' },
        create: { id: 1, defaultPrompt: 'Updated prompt' },
      });
      expect(result).toEqual(mockConfig);
    });
  });
});
