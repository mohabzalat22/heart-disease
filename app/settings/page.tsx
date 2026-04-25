import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRepo } from '@/repositories/userRepo';
import { PromptRepo } from '@/repositories/promptRepo';
import { SettingsForm } from '@/components/settings/settings-form';
import { Suspense } from 'react';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect('/login');
  }

  const user = await UserRepo.findById(payload.userId);
  if (!user) {
    redirect('/login');
  }

  const prompt = await PromptRepo.findByUserId(user.id);

  return (
    <div className="container mx-auto py-10 px-4 md:px-0 max-w-5xl">
      <Suspense fallback={<div>Loading...</div>}>
        <SettingsForm
          initialUser={{
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            tokens: user.tokens,
          }}
          initialPrompt={prompt?.prompt || ''}
        />
      </Suspense>
    </div>
  );
}
