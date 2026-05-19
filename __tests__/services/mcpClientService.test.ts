const mockConnect = jest.fn();
const mockListTools = jest.fn();
const mockCallTool = jest.fn();

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        connect: mockConnect,
        listTools: mockListTools,
        callTool: mockCallTool,
      };
    }),
  };
});

jest.mock('@modelcontextprotocol/sdk/client/sse.js', () => {
  return {
    SSEClientTransport: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

import { mcpClientService } from '@/services/mcpClientService';

describe('mcpClientService', () => {
  const originalEnvUrl = process.env.MCP_SERVER_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset global variables used in mcpClientService
    globalThis.mcpConnected = false;
    globalThis.mcpConnecting = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.MCP_SERVER_URL = originalEnvUrl;
  });

  describe('getInstance', () => {
    it('returns the same instance and lazily creates a new one if cleared', () => {
      const instance1 = mcpClientService;
      // @ts-ignore
      const instance2 = mcpClientService.constructor.getInstance();
      expect(instance1).toBe(instance2);

      // Force-clear static instance to test lazy creation path
      // @ts-ignore
      mcpClientService.constructor.instance = undefined;
      // @ts-ignore
      const instance3 = mcpClientService.constructor.getInstance();
      expect(instance3).toBeDefined();
    });
  });

  describe('connect', () => {
    it('successfully connects to the MCP server', async () => {
      mockConnect.mockResolvedValue(undefined);

      await mcpClientService.connect();

      expect(mockConnect).toHaveBeenCalled();
      expect(globalThis.mcpConnected).toBe(true);
    });

    it('does not reconnect if already connected', async () => {
      globalThis.mcpConnected = true;

      await mcpClientService.connect();

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('waits if connection is already in progress', async () => {
      globalThis.mcpConnecting = true;
      
      // Simulate connection completion in 150ms
      setTimeout(() => {
        globalThis.mcpConnecting = false;
        globalThis.mcpConnected = true;
      }, 150);

      await mcpClientService.connect();

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it('handles connection error and resets mcpConnecting', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await expect(mcpClientService.connect()).rejects.toThrow('Connection failed');
      expect(globalThis.mcpConnecting).toBe(false);
      expect(globalThis.mcpConnected).toBeFalsy();
    });

    it('uses default fallback server URL if MCP_SERVER_URL is not set', async () => {
      delete process.env.MCP_SERVER_URL;
      mockConnect.mockResolvedValue(undefined);

      await mcpClientService.connect();

      expect(mockConnect).toHaveBeenCalled();
    });

    it('uses server URL as-is if it already ends with /sse', async () => {
      process.env.MCP_SERVER_URL = 'http://localhost:5000/sse';
      mockConnect.mockResolvedValue(undefined);

      await mcpClientService.connect();

      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe('listTools', () => {
    it('connects and lists tools', async () => {
      mockConnect.mockResolvedValue(undefined);
      const mockToolsList = { tools: [{ name: 'predict_heart_disease' }] };
      mockListTools.mockResolvedValue(mockToolsList);

      const tools = await mcpClientService.listTools();

      expect(mockConnect).toHaveBeenCalled();
      expect(mockListTools).toHaveBeenCalled();
      expect(tools).toEqual(mockToolsList);
    });
  });

  describe('predictHeartDisease', () => {
    const sampleArgs = {
      age: 52,
      sex: 1,
      resting_bp: 125,
      cholesterol: 212,
      fasting_bs: 0,
      max_hr: 168,
      exercise_angina: 0,
      oldpeak: 1.0,
      chest_pain_type: 'ASY' as const,
      resting_ecg: 'Normal' as const,
      st_slope: 'Flat' as const,
    };

    it('calls the predict_heart_disease tool and returns parsed JSON content', async () => {
      mockConnect.mockResolvedValue(undefined);
      mockCallTool.mockResolvedValue({
        isError: false,
        content: [{ type: 'text', text: JSON.stringify({ prediction: 'Normal', risk: 'Low' }) }],
      });

      const response = await mcpClientService.predictHeartDisease(sampleArgs);

      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'predict_heart_disease',
        arguments: sampleArgs,
      });
      expect(response).toEqual({ prediction: 'Normal', risk: 'Low' });
    });

    it('returns raw text if content is not JSON', async () => {
      mockConnect.mockResolvedValue(undefined);
      mockCallTool.mockResolvedValue({
        isError: false,
        content: [{ type: 'text', text: 'Normal text response' }],
      });

      const response = await mcpClientService.predictHeartDisease(sampleArgs);
      expect(response).toBe('Normal text response');
    });

    it('returns the first content object directly if not type text', async () => {
      mockConnect.mockResolvedValue(undefined);
      const expectedResponse = { type: 'other', data: 'some-data' };
      mockCallTool.mockResolvedValue({
        isError: false,
        content: [expectedResponse],
      });

      const response = await mcpClientService.predictHeartDisease(sampleArgs);
      expect(response).toEqual(expectedResponse);
    });

    it('throws an error if the tool returns isError true', async () => {
      mockConnect.mockResolvedValue(undefined);
      mockCallTool.mockResolvedValue({
        isError: true,
        content: 'Some tool error details',
      });

      await expect(mcpClientService.predictHeartDisease(sampleArgs)).rejects.toThrow(
        'MCP Tool Error: "Some tool error details"'
      );
    });

    it('throws an error if empty content is returned', async () => {
      mockConnect.mockResolvedValue(undefined);
      mockCallTool.mockResolvedValue({
        isError: false,
        content: [],
      });

      await expect(mcpClientService.predictHeartDisease(sampleArgs)).rejects.toThrow(
        'MCP Tool returned empty content'
      );
    });
  });

  describe('callTool', () => {
    it('calls custom tool and returns tool output', async () => {
      mockConnect.mockResolvedValue(undefined);
      const expectedOutput = { content: [{ type: 'text', text: 'success' }] };
      mockCallTool.mockResolvedValue(expectedOutput);

      const result = await mcpClientService.callTool('custom_tool', { param: 'value' });

      expect(mockCallTool).toHaveBeenCalledWith({
        name: 'custom_tool',
        arguments: { param: 'value' },
      });
      expect(result).toEqual(expectedOutput);
    });
  });
});
