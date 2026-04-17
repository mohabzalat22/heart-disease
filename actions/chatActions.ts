'use server';

import { ChatService } from '@/services/chatService';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

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
    revalidatePath('/chat');
    redirect(`/chat/${chat.token}`);
  }
}

export async function updateChatTitle(token: string, title: string) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const verifiedUser = authToken ? await verifyToken(authToken) : null;

  if (!verifiedUser) {
    throw new Error('Unauthorized');
  }

  const chat = await ChatService.getByToken(token);
  if (!chat || chat.userId !== verifiedUser.userId) {
    throw new Error('Chat not found or unauthorized');
  }

  await ChatService.update(chat.id, { title });
  revalidatePath('/chat');
}

export async function deleteChat(token: string) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const verifiedUser = authToken ? await verifyToken(authToken) : null;

  if (!verifiedUser) {
    throw new Error('Unauthorized');
  }

  const chat = await ChatService.getByToken(token);
  if (!chat || chat.userId !== verifiedUser.userId) {
    throw new Error('Chat not found or unauthorized');
  }

  await ChatService.deleteByToken(token);
  revalidatePath('/chat');
  return { success: true };
}

export async function getUserChats() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const verifiedUser = authToken ? await verifyToken(authToken) : null;

  if (!verifiedUser) {
    throw new Error('Unauthorized');
  }

  const chats = await ChatService.getAll(verifiedUser.userId);
  return chats;
}
