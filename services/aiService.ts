import { type Message } from '@/types/message';
import { MessageService } from './messageService';
import { Actor } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRepo } from '@/repositories/userRepo';
import { mcpClientService } from './mcpClientService';

export const AIService = {
  respond: async (chatId: number, userId: number) => {
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
      const promptText = [
        systemPrompt,
        ...messages.map((m: Message) => m.message),
      ]
        .filter(Boolean)
        .join(' ');
      const estimatedPromptTokens = Math.ceil(promptText.length / 4);
      numPredict = Math.max(1, userBalance.remaining - estimatedPromptTokens);
    }

    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let closed = false;

        const safeEnqueue = (data: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(data));
          } catch {
            closed = true;
          }
        };

        const safeClose = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {}
        };

        try {
          // Fetch MCP tools
          let tools: Record<string, unknown>[] = [];

          try {
            const mcpTools = await mcpClientService.listTools();

            tools = mcpTools.tools.map(
              (t: {
                name: string;
                description?: string;
                inputSchema: unknown;
              }) => ({
                type: 'function',
                function: {
                  name: t.name,
                  description: t.description,
                  parameters: t.inputSchema,
                },
              })
            );
          } catch (mcpError) {
            console.error('Failed to fetch MCP tools:', mcpError);
          }

          const currentMessages: Record<string, unknown>[] = [
            ...(systemPrompt
              ? [{ role: 'system', content: systemPrompt }]
              : []),
            ...messages.map((m: Message) => ({
              role: m.actor === Actor.USER ? 'user' : 'assistant',
              content: m.message,
            })),
          ];

          let maxIterations = 5;

          while (maxIterations-- > 0 && !closed) {
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

            const response = await fetch(
              `${process.env.OLLAMA_BASE_URL}/api/chat`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
              }
            );

            if (!response.ok || !response.body) {
              throw new Error(
                `Cannot connect to Ollama at ${process.env.OLLAMA_BASE_URL}`
              );
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';
            let currentIterationContent = '';
            const toolCalls: any[] = [];

            while (!closed) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.trim()) continue;

                try {
                  const parsed = JSON.parse(line);

                  if (parsed.message?.content) {
                    currentIterationContent += parsed.message.content;

                    safeEnqueue(
                      `data: ${JSON.stringify({
                        content: parsed.message.content,
                      })}\n\n`
                    );
                  }

                  if (parsed.message?.tool_calls) {
                    toolCalls.push(...parsed.message.tool_calls);
                  }

                  if (parsed.done) {
                    const totalTokens =
                      (parsed.prompt_eval_count || 0) +
                      (parsed.eval_count || 0);

                    if (totalTokens > 0) {
                      await UserRepo.deductTokens(userId, totalTokens);

                      safeEnqueue(
                        `data: ${JSON.stringify({
                          usage: { totalTokens },
                        })}\n\n`
                      );
                    }
                  }
                } catch (e) {
                  console.error('Ollama parse error:', e);
                }
              }
            }

            // Tool calling loop
            if (toolCalls.length > 0 && !closed) {
              currentMessages.push({
                role: 'assistant',
                content: currentIterationContent,
                tool_calls: toolCalls,
              } as any);

              for (const toolCall of toolCalls) {
                if (closed) break;

                const name = toolCall.function.name;
                const args = toolCall.function.arguments;

                safeEnqueue(
                  `data: ${JSON.stringify({
                    content: `\n\n*System: Executing tool ${name}...*\n\n`,
                  })}\n\n`
                );

                try {
                  const result = await mcpClientService.callTool(name, args);

                  currentMessages.push({
                    role: 'tool',
                    content: JSON.stringify(result),
                    tool_call_id: toolCall.id,
                  } as any);
                } catch (toolError) {
                  currentMessages.push({
                    role: 'tool',
                    content: `Error: ${
                      toolError instanceof Error
                        ? toolError.message
                        : String(toolError)
                    }`,
                    tool_call_id: toolCall.id,
                  } as any);
                }
              }

              continue;
            }

            break;
          }

          safeEnqueue(`data: [DONE]\n\n`);
          safeClose();
        } catch (error) {
          logger.error(error, 'Ollama streaming error');

          safeEnqueue(
            `data: ${JSON.stringify({
              error: 'Failed to connect to Ollama. Check OLLAMA_BASE_URL.',
            })}\n\n`
          );

          safeEnqueue(`data: [DONE]\n\n`);
          safeClose();
        }
      },
    });
  },

  saveResponse: async (chatId: number, message: string) => {
    return MessageService.create({
      chatId,
      actor: Actor.ASSISTANT,
      message,
    });
  },
};
