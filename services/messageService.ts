import asyncWrapper from '@/lib/utils/asyncWrapper';
import { MessageRepository } from '@/repositories/messageRepository';
import type { Message, CreateMessage } from '@/types/message';

export const MessageService = {
  create: (data: CreateMessage) =>
    asyncWrapper<Message | null>(() => MessageRepository.create(data)),

  getAll: (chatId: number) =>
    asyncWrapper<Message[] | null>(() => MessageRepository.getAll(chatId)),

  getById: (id: number) =>
    asyncWrapper<Message | null>(() => MessageRepository.getById(id)),

  update: (id: number, data: Partial<Message>) =>
    asyncWrapper<Message | null>(() => MessageRepository.update(id, data)),

  deleteById: (id: number) =>
    asyncWrapper(() => MessageRepository.deleteById(id)),
};
