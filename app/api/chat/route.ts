import { AIService } from '@/services/aiService';
import { prisma } from '@/lib/prisma';
import { MessageService } from '@/services/messageService';

import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Actor } from '@/generated/prisma';

import crypto from 'crypto';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const verifiedUser = token ? await verifyToken(token) : null;

  if (!verifiedUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { chatId, message } = body;

    // If chatId is 0, create a new chat first
    let currentChatId = Number(chatId);
    let chatToken = '';

    if (currentChatId === 0) {
      chatToken = crypto.randomBytes(24).toString('hex');
      const newChat = await prisma.chat.create({
        data: {
          userId: verifiedUser.userId,
          token: chatToken,
          title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        },
      });
      currentChatId = newChat.id;
    } else {
      const existingChat = await prisma.chat.findUnique({
        where: { id: currentChatId },
      });
      chatToken = existingChat?.token || '';
    }

    // Save user message
    const savedMessage = await MessageService.create({
      chatId: currentChatId,
      actor: Actor.USER,
      message,
    });

    if (!savedMessage) {
      return new Response('Failed to save message', { status: 500 });
    }

    // Get streaming response from AI
    const stream = await AIService.respond(currentChatId, verifiedUser.userId);

    // Collect response in background to save it
    let fullResponse = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        // SSE format is "data: {...}\n\n"
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                }
              } catch (e) {
                console.error('Chat error:', e);
              }
            }
          }
        }
        controller.enqueue(chunk);
      },
      flush() {
        if (fullResponse) {
          AIService.saveResponse(currentChatId, fullResponse);
        }
      },
    });

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Chat-Id': chatToken,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
