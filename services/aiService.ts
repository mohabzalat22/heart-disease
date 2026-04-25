import { type Message } from '@/types/message';
import { MessageService } from './messageService';
import { Actor } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRepo } from '@/repositories/userRepo';

export const AIService = {
  /**
   * Generate a streaming response from Ollama based on chat context
   * @param chatId - The chat ID to get message context from
   * @returns ReadableStream with Ollama response
   */
  respond: async (chatId: number, userId: number) => {
    // Get all messages from specific chat for context
    const messages = await MessageService.getAll(chatId);

    if (!messages) {
      throw new Error('Unable to fetch messages for context');
    }

    const systemConfig = await prisma.systemConfig.findFirst({
      where: { id: 1 },
    });

    const userPrompt = await prisma.prompt.findUnique({
      where: { userId },
    });

    const systemPrompt = [systemConfig?.defaultPrompt, userPrompt?.prompt]
      .filter(Boolean)
      .join('\n\n');

    const userBalance = await UserRepo.checkTokenBalance(userId);
    let numPredict: number | undefined;
    if (userBalance.allowed && userBalance.remaining !== null) {
      const promptText = [systemPrompt, ...messages.map((m: Message) => m.message)].filter(Boolean).join(' ');
      const estimatedPromptTokens = Math.ceil(promptText.length / 4);
      numPredict = Math.max(1, userBalance.remaining - estimatedPromptTokens);
    }

    // Create a ReadableStream that streams Ollama response in SSE format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Generate content with streaming from Ollama
          const bodyPayload: Record<string, unknown> = {
            model: process.env.OLLAMA_MODEL || 'minimax-m2.5:cloud', // Using the model currently available in Ollama
            messages: [
              ...(systemPrompt
                ? [{ role: 'system', content: systemPrompt }]
                : []),
              ...messages.map((m: Message) => ({
                role: m.actor === Actor.USER ? 'user' : 'assistant',
                content: m.message,
              })),
            ],
            stream: true,
          };

          if (numPredict !== undefined) {
            bodyPayload.options = { num_predict: numPredict };
          }

          const response = await fetch(
            `${process.env.OLLAMA_BASE_URL}/api/chat`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(bodyPayload),
            }
          );

          if (!response.ok || !response.body) {
            throw new Error(
              `Cannot establish a connection to Ollama connect on ${process.env.OLLAMA_BASE_URL}.`
            );
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the incomplete line in buffer

            for (const line of lines) {
              if (line.trim() === '') continue;

              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content !== undefined) {
                  // Send each chunk in SSE format
                  const sseMessage = `data: ${JSON.stringify({ content: parsed.message.content })}\n\n`;
                  controller.enqueue(encoder.encode(sseMessage));
                }
                
                if (parsed.done) {
                  const promptTokens = parsed.prompt_eval_count || 0;
                  const completionTokens = parsed.eval_count || 0;
                  const totalTokens = promptTokens + completionTokens;
                  
                  if (totalTokens > 0) {
                    await UserRepo.deductTokens(userId, totalTokens);
                    
                    // Send usage metadata to the client
                    const usageMessage = `data: ${JSON.stringify({ usage: { totalTokens } })}\n\n`;
                    controller.enqueue(encoder.encode(usageMessage));
                  }
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
          logger.error(error, 'Ollama streaming error');
          const errorMessage = `data: ${JSON.stringify({ error: 'Failed to connect to Ollama. Check OLLAMA_BASE_URL and ensure Ollama is running.' })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
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
