'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleChatShare(chatId: number, isShared: boolean) {
  try {
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        isShared,
        sharedAt: isShared ? new Date() : null,
      },
    });

    revalidatePath(`/chat/${chatId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle chat share:', error);
    return { success: false, error: 'Failed to update sharing status' };
  }
}

export async function getChatByToken(token: string) {
  try {
    const chat = await prisma.chat.findUnique({
      where: { token, isShared: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return chat;
  } catch (error) {
    console.error('Failed to get chat by token:', error);
    return null;
  }
}
