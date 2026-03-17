import { type Message } from '@/types/message';
import { MessageService } from './messageService';
import { Actor } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export const AIService = {
  /**
   * Generate a streaming response from Ollama based on chat context
   * @param chatId - The chat ID to get message context from
   * @returns ReadableStream with Ollama response
   */
  respond: async (chatId: number) => {
    // Get all messages from specific chat for context
    const messages = await MessageService.getAll(chatId);

    if (!messages) {
      throw new Error('Unable to fetch messages for context');
    }

    const prompt = await prisma.prompt.findFirst();

    // Create a ReadableStream that streams Ollama response in SSE format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Generate content with streaming from Ollama
          const response = await fetch(
            `${process.env.OLLAMA_BASE_URL}/api/chat`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || 'minimax-m2.5:cloud', // Using the model currently available in Ollama
                messages: [
                  ...(prompt?.prompt
                    ? [{ role: 'system', content: prompt.prompt }]
                    : []),
                  ...messages.map((m: Message) => ({
                    role: m.actor === Actor.USER ? 'user' : 'assistant',
                    content: m.message,
                  })),
                ],
                stream: true,
              }),
            }
          );

          if (!response.ok || !response.body) {
            throw new Error(
              `Cannot establish a connection to Ollama connect on ${process.env.OLLAMA_BASE_URL}.`
            );
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim() === '') continue;

              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content !== undefined) {
                  // Send each chunk in SSE format
                  const sseMessage = `data: ${JSON.stringify({ content: parsed.message.content })}\n\n`;
                  controller.enqueue(encoder.encode(sseMessage));
                }
              } catch (e) {
                console.error('Ollama streaming error:', e);
              }
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Ollama streaming error:', error);
          controller.error(error);
        }
      },
    });

    return stream;
  },

  /**
   * Save the complete AI response to the database
   * @param chatId - The chat ID to save the message to
   * @param message - The complete AI response message
   */
  saveResponse: async (chatId: number, message: string) => {
    const messageData = {
      chatId,
      actor: Actor.ASSISTANT,
      message,
    };

    return await MessageService.create(messageData);
  },
};
