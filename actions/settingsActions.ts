'use server';

import { UserRepo } from '../repositories/userRepo';
import { PromptRepo } from '../repositories/promptRepo';
import { verifyToken, setAuthCookie, signToken } from '../lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AuthError, AuthState } from '../types';
import { revalidatePath } from 'next/cache';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().optional(),
});

const promptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
});

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function updateProfile(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { message: 'Not authenticated' };
  }

  const validatedFields = profileSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const updatedUser = await UserRepo.updateUser(user.userId, {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      image: validatedFields.data.image,
    });

    // Update the auth token if any identifier changed
    const newToken = await signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    await setAuthCookie(newToken);

    revalidatePath('/settings');
    revalidatePath('/');
    return { message: 'Profile updated successfully' };
  } catch (err: unknown) {
    return {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    };
  }
}

export async function updateSystemPrompt(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { message: 'Not authenticated' };
  }

  const validatedFields = promptSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors as AuthError };
  }

  try {
    await PromptRepo.upsertPrompt(user.userId, validatedFields.data.prompt);
    revalidatePath('/settings');
    return { message: 'System prompt updated successfully' };
  } catch (err: unknown) {
    return {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    };
  }
}
