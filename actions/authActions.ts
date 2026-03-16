'use server';

import { AuthService } from '../services/authService';
import { setAuthCookie, removeAuthCookie } from '../lib/auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AuthState } from '../types';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function handleSignUp(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = signUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { token } = await AuthService.signUp(validatedFields.data);
    await setAuthCookie(token);
  } catch (err: unknown) {
    return {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    };
  }

  redirect('/');
}

export async function handleSignIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = signInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { token } = await AuthService.signIn(validatedFields.data);
    await setAuthCookie(token);
  } catch (err: unknown) {
    return {
      message: err instanceof Error ? err.message : 'An unknown error occurred',
    };
  }

  redirect('/');
}

export async function handleSignOut() {
  await removeAuthCookie();
  redirect('/login');
}
