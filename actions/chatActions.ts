'use server';

import { ChatService } from '@/services/chatService';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

import crypto from 'crypto';

export async function createNewChat() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const verifiedUser = token ? await verifyToken(token) : null;

  if (!verifiedUser) {
    redirect('/login');
  }

  const chatToken = crypto.randomBytes(24).toString('hex');

  const chat = await ChatService.create({
    userId: verifiedUser.userId,
    token: chatToken,
    title: 'New Assessment',
  });

  if (chat) {
    redirect(`/chat/${chat.token}`);
  }
}
