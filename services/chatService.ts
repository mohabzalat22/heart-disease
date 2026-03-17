import asyncWrapper from '@/lib/utils/asyncWrapper';
import { ChatRepository } from '@/repositories/chatRepository';
import type { Chat, CreateChat } from '@/types/chat';

export const ChatService = {
  create: (data: CreateChat) =>
    asyncWrapper<Chat | null>(() => ChatRepository.create(data)),

  getAll: (userId: number) =>
    asyncWrapper<Chat[] | null>(() => ChatRepository.getAll(userId)),

  getById: (id: number) =>
    asyncWrapper<Chat | null>(() => ChatRepository.getById(id)),

  getByToken: (token: string) =>
    asyncWrapper<Chat | null>(() => ChatRepository.getByToken(token)),

  update: (id: number, data: Partial<Chat>) =>
    asyncWrapper<Chat | null>(() => ChatRepository.update(id, data)),

  deleteById: (id: number) => asyncWrapper(() => ChatRepository.deleteById(id)),

  deleteByToken: (token: string) =>
    asyncWrapper(() => ChatRepository.deleteByToken(token)),
};
