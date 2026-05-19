jest.mock('@/services/messageService', () => ({
  MessageService: {
    getAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    systemConfig: { findFirst: jest.fn() },
    prompt: { findUnique: jest.fn() },
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@/repositories/userRepo', () => ({
  UserRepo: {
    checkTokenBalance: jest.fn(),
    deductTokens: jest.fn(),
  },
}));

jest.mock('@/services/mcpClientService', () => ({
  mcpClientService: {
    listTools: jest.fn(),
    callTool: jest.fn(),
  },
}));

import { AIService } from '@/services/aiService';
import { MessageService } from '@/services/messageService';

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveResponse', () => {
    it('saves an AI response message with ASSISTANT actor', async () => {
      const mockMessage = {
        id: 1,
        chatId: 1,
        actor: 'ASSISTANT',
        message: 'Hello, I am AI',
        createdAt: new Date(),
      };
      (MessageService.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await AIService.saveResponse(1, 'Hello, I am AI');

      expect(MessageService.create).toHaveBeenCalledWith({
        chatId: 1,
        actor: 'ASSISTANT',
        message: 'Hello, I am AI',
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('respond', () => {
    it('throws when messages cannot be fetched', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue(null);

      await expect(AIService.respond(1, 1)).rejects.toThrow(
        'Unable to fetch messages for context'
      );
    });

    it('returns a ReadableStream on success', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([
        { id: 1, chatId: 1, actor: 'USER', message: 'Hi' },
      ]);

      const { prisma } = require('@/lib/prisma');
      (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.prompt.findUnique as jest.Mock).mockResolvedValue(null);

      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: null,
      });

      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({ tools: [] });

      // Mock the Ollama fetch response
      const mockResponseBody = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: 'Hello!' },
                done: false,
              }) + '\n'
            )
          );
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                message: { content: '' },
                done: true,
                prompt_eval_count: 10,
                eval_count: 5,
              }) + '\n'
            )
          );
          controller.close();
        },
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: mockResponseBody,
      });

      const stream = await AIService.respond(1, 1);
      expect(stream).toBeInstanceOf(ReadableStream);

      // Read the stream to verify it works
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value);
      }

      expect(output).toContain('Hello!');
      expect(output).toContain('[DONE]');
    });

    it('sets numPredict when userBalance has remaining tokens', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { prisma } = require('@/lib/prisma');
      (prisma.systemConfig.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.prompt.findUnique as jest.Mock).mockResolvedValue(null);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: 100 });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({ tools: [] });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) { controller.close(); },
        }),
      });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      while (!(await reader.read()).done) {}

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"options":{"num_predict":99}'),
        })
      );
    });

    it('handles MCP tool list fetch error gracefully', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: null });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockRejectedValue(new Error('MCP failure'));

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) { controller.close(); },
        }),
      });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      while (!(await reader.read()).done) {}

      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles connection error when fetch fails', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: null });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({ tools: [] });

      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += new TextDecoder().decode(value);
      }

      expect(output).toContain('Failed to connect to Ollama');
      expect(output).toContain('[DONE]');
    });

    it('handles Ollama streaming JSON parse errors', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: null });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({ tools: [] });

      const mockResponseBody = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode('Invalid JSON\n'));
          controller.close();
        },
      });

      global.fetch = jest.fn().mockResolvedValue({ ok: true, body: mockResponseBody });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      while (!(await reader.read()).done) {}

      // Should not throw, should finish
      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles and executes tool calls correctly', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: null });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({
        tools: [{ name: 'test_tool', inputSchema: {} }],
      });
      (mcpClientService.callTool as jest.Mock).mockResolvedValue({ result: 'tool success' });

      let iteration = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        iteration++;
        const mockResponseBody = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            if (iteration === 1) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    message: {
                      content: '',
                      tool_calls: [{ id: '1', type: 'function', function: { name: 'test_tool', arguments: {} } }],
                    },
                    done: true,
                  }) + '\n'
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(JSON.stringify({ message: { content: 'Final answer' }, done: true }) + '\n')
              );
            }
            controller.close();
          },
        });
        return Promise.resolve({ ok: true, body: mockResponseBody });
      });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += new TextDecoder().decode(value);
      }

      expect(mcpClientService.callTool).toHaveBeenCalledWith('test_tool', {});
      expect(output).toContain('Executing tool test_tool');
      expect(output).toContain('Final answer');
    });

    it('handles tool execution errors', async () => {
      (MessageService.getAll as jest.Mock).mockResolvedValue([{ id: 1, chatId: 1, actor: 'USER', message: 'Hi' }]);
      const { UserRepo } = require('@/repositories/userRepo');
      (UserRepo.checkTokenBalance as jest.Mock).mockResolvedValue({ allowed: true, remaining: null });
      const { mcpClientService } = require('@/services/mcpClientService');
      (mcpClientService.listTools as jest.Mock).mockResolvedValue({
        tools: [{ name: 'test_tool', inputSchema: {} }],
      });
      (mcpClientService.callTool as jest.Mock).mockRejectedValue(new Error('Tool failed'));

      let iteration = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        iteration++;
        const mockResponseBody = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            if (iteration === 1) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    message: {
                      content: '',
                      tool_calls: [{ id: '1', type: 'function', function: { name: 'test_tool', arguments: {} } }],
                    },
                    done: true,
                  }) + '\n'
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(JSON.stringify({ message: { content: 'Recovered' }, done: true }) + '\n')
              );
            }
            controller.close();
          },
        });
        return Promise.resolve({ ok: true, body: mockResponseBody });
      });

      const stream = await AIService.respond(1, 1);
      const reader = stream.getReader();
      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += new TextDecoder().decode(value);
      }

      expect(mcpClientService.callTool).toHaveBeenCalledWith('test_tool', {});
      expect(output).toContain('Recovered');
    });
  });
});
