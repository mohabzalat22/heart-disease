jest.mock('@/services/mcpClientService', () => ({
  mcpClientService: { predictHeartDisease: jest.fn() },
}));
jest.mock('@/repositories/userRepo', () => ({
  UserRepo: { checkTokenBalance: jest.fn(), deductTokens: jest.fn() },
}));
jest.mock('@/lib/auth', () => ({ verifyToken: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn() }));

import { predictHeartDiseaseAction } from '@/actions/predictionActions';
import { mcpClientService } from '@/services/mcpClientService';
import { UserRepo } from '@/repositories/userRepo';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

const sampleArgs = {
  age: 52, sex: 1, resting_bp: 125, cholesterol: 212,
  fasting_bs: 0, max_hr: 168, exercise_angina: 0, oldpeak: 1.0,
  chest_pain_type: 'ASY' as const, resting_ecg: 'Normal' as const,
  st_slope: 'Flat' as const,
};

describe('Prediction Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'tok' }),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (verifyToken as jest.Mock).mockResolvedValue(null);
    const r = await predictHeartDiseaseAction(sampleArgs);
    expect(r).toEqual({ error: 'Unauthorized', status: 401 });
  });

  it('returns 401 when token is missing', async () => {
    mockedCookies.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    } as any);
    const r = await predictHeartDiseaseAction(sampleArgs);
    expect(r).toEqual({ error: 'Unauthorized', status: 401 });
  });

  it('returns 402 when insufficient tokens', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: false });
    const r = await predictHeartDiseaseAction(sampleArgs);
    expect(r).toEqual({ error: 'Insufficient tokens', status: 402 });
  });

  it('returns prediction result on success', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true });
    const prediction = { prediction: 1, probability: 0.85, risk_level: 'High', recommendations: [] };
    (mcpClientService.predictHeartDisease as jest.Mock).mockResolvedValue(prediction);

    const r = await predictHeartDiseaseAction(sampleArgs);

    expect(r).toEqual({ data: prediction, status: 200 });
    expect(UserRepo.deductTokens).toHaveBeenCalledWith(1, 500);
  });

  it('returns 500 on error', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true });
    (mcpClientService.predictHeartDisease as jest.Mock).mockRejectedValue(new Error('MCP down'));

    const r = await predictHeartDiseaseAction(sampleArgs);
    expect(r).toEqual({ error: 'MCP down', status: 500 });
  });

  it('returns 500 on non-Error exception', async () => {
    (verifyToken as jest.Mock).mockResolvedValue({ userId: 1 });
    (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true });
    (mcpClientService.predictHeartDisease as jest.Mock).mockRejectedValue('String error');

    const r = await predictHeartDiseaseAction(sampleArgs);
    expect(r).toEqual({ error: 'Internal Server Error', status: 500 });
  });
});
