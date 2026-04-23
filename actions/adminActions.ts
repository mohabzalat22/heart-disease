'use server';

import { SystemRepo } from '../repositories/systemRepo';
import { verifyToken } from '../lib/auth';
import { UserRepo } from '../repositories/userRepo';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;

  const payload = await verifyToken(token);
  if (!payload) return false;

  const user = await UserRepo.findById(payload.userId);
  return user?.role === 'ADMIN';
}

export async function updateGlobalPrompt(prompt: string) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  await SystemRepo.updateDefaultPrompt(prompt);
  revalidatePath('/admin');
  return { success: true };
}

export async function getGlobalPrompt() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return '';
  }
  return await SystemRepo.getDefaultPrompt();
}
