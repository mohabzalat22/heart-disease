'use server';

import { mcpClientService } from '@/services/mcpClientService';
import { PredictHeartDiseaseArgs } from '@/types/index';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRepo } from '@/repositories/userRepo';

export async function predictHeartDiseaseAction(args: PredictHeartDiseaseArgs) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const verifiedUser = token ? await verifyToken(token) : null;

    if (!verifiedUser) {
      return { error: 'Unauthorized', status: 401 };
    }

    const balanceResult = await UserRepo.checkTokenBalance(verifiedUser.userId);
    if (!balanceResult.allowed) {
      return { error: 'Insufficient tokens', status: 402 };
    }

    console.log('🤖 Calling MCP predictHeartDisease with args:', args);
    const result = await mcpClientService.predictHeartDisease(args);
    
    await UserRepo.deductTokens(verifiedUser.userId, 500);

    return { data: result, status: 200 };
  } catch (error) {
    console.error('Prediction Action Error:', error);
    return { error: error instanceof Error ? error.message : 'Internal Server Error', status: 500 };
  }
}
