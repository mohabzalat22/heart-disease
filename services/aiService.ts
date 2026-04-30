import { type Message } from '@/types/message';
import { MessageService } from './messageService';
import { Actor } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRepo } from '@/repositories/userRepo';
import { mcpClientService } from './mcpClientService';

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
          // Fetch tools from MCP server
          let tools: Record<string, unknown>[] = [];
          try {
            const mcpTools = await mcpClientService.listTools();
            tools = mcpTools.tools.map((t: { name: string; description?: string; inputSchema: unknown }) => ({
              type: 'function',
              function: {
                name: t.name,
                description: t.description,
                parameters: t.inputSchema,
              },
            }));
          } catch (mcpError) {
            console.error('Failed to fetch MCP tools for AI context:', mcpError);
          }

          const currentMessages: Record<string, unknown>[] = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages.map((m: Message) => ({
              role: m.actor === Actor.USER ? 'user' : 'assistant',
              content: m.message,
            })),
          ];

          let maxIterations = 5;

          while (maxIterations-- > 0) {
            const bodyPayload: Record<string, unknown> = {
              model: process.env.OLLAMA_MODEL || 'minimax-m2.5:cloud',
              messages: currentMessages,
              stream: true,
            };

            if (tools.length > 0) {
              bodyPayload.tools = tools;
            }

            if (numPredict !== undefined) {
              bodyPayload.options = { num_predict: numPredict };
            }

            const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyPayload),
            });

            if (!response.ok || !response.body) {
              throw new Error(`Cannot establish a connection to Ollama on ${process.env.OLLAMA_BASE_URL}.`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let currentIterationContent = '';
            const toolCalls: { id: string; type: string; function: { name: string; arguments: Record<string, unknown> } }[] = [];

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim() === '') continue;

                try {
                  const parsed = JSON.parse(line);
                  
                  // Handle regular content
                  if (parsed.message?.content) {
                    currentIterationContent += parsed.message.content;
                    const sseMessage = `data: ${JSON.stringify({ content: parsed.message.content })}\n\n`;
                    controller.enqueue(encoder.encode(sseMessage));
                  }

                  // Handle tool calls
                  if (parsed.message?.tool_calls) {
                    toolCalls.push(...parsed.message.tool_calls);
                  }

                  if (parsed.done) {
                    const totalTokens = (parsed.prompt_eval_count || 0) + (parsed.eval_count || 0);
                    if (totalTokens > 0) {
                      await UserRepo.deductTokens(userId, totalTokens);
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ usage: { totalTokens } })}\n\n`));
                    }
                  }
                } catch (e) {
                  console.error('Ollama streaming error:', e);
                }
              }
            }

            if (toolCalls.length > 0) {
              // Add the assistant's message with tool calls to the history
              currentMessages.push({
                role: 'assistant',
                content: currentIterationContent,
                tool_calls: toolCalls,
              } as Record<string, unknown>);

              // Execute tool calls
              for (const toolCall of toolCalls) {
                const name = toolCall.function.name;
                const args = toolCall.function.arguments;

                console.log(`🛠️ Executing MCP tool: ${name}`, args);
                
                // Show a status update in the chat
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `\n\n*System: Executing tool ${name}...*\n\n` })}\n\n`));

                try {
                  const result = await mcpClientService.callTool(name, args);
                  const resultString = JSON.stringify(result);
                  
                  currentMessages.push({
                    role: 'tool',
                    content: resultString,
                    tool_call_id: toolCall.id,
                  } as Record<string, unknown>);
                } catch (toolError) {
                  console.error(`Error executing tool ${name}:`, toolError);
                  currentMessages.push({
                    role: 'tool',
                    content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
                    tool_call_id: toolCall.id,
                  } as Record<string, unknown>);
                }
              }
              // Loop continues to get the model's reaction to tool results
              continue;
            } else {
              // No more tool calls, we're done
              break;
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          logger.error(error, 'Ollama streaming error');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to connect to Ollama. Check OLLAMA_BASE_URL and ensure Ollama is running.' })}\n\n`));
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
