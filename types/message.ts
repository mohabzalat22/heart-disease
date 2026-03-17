import { Actor } from '@/generated/prisma';

export interface Message {
  id: number;
  chatId: number;
  actor: Actor;
  message: string;
  createdAt: Date;
}

export interface CreateMessage {
  chatId: number;
  actor: Actor;
  message: string;
}
