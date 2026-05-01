import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import dotenv from "dotenv";
import path from "path";
import { PredictHeartDiseaseArgs, PredictHeartDiseaseResponse } from "@/types/index";

// Ensure .env is loaded from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

declare global {
  var mcpClient: Client | undefined;
  var mcpConnected: boolean | undefined;
  var mcpConnecting: boolean | undefined;
}


class MCPClientService {
  private static instance: MCPClientService;

  private constructor() {
    // Client creation is deferred to the global singleton helper below.
  }

  private getClient() {
    if (!globalThis.mcpClient) {
      globalThis.mcpClient = new Client({
        name: "cardioai-mcp-client",
        version: "1.0.0",
      });
    }

    return globalThis.mcpClient;
  }

  public static getInstance(): MCPClientService {
    if (!MCPClientService.instance) {
      MCPClientService.instance = new MCPClientService();
    }
    return MCPClientService.instance;
  }

  /**
   * Ensures the client is connected to the MCP server.
   * Handles concurrent connection attempts and connection state.
   */
  public async connect() {
    if (globalThis.mcpConnected) return;
    if (globalThis.mcpConnecting) {
      // Wait for existing connection attempt
      while (globalThis.mcpConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    globalThis.mcpConnecting = true;
    try {
      const client = this.getClient();
      const serverUrl = process.env.MCP_SERVER_URL || "http://localhost:5000";
      console.log(`🔌 Connecting to MCP Server at ${serverUrl}...`);
      
      const sseUrl = serverUrl.endsWith("/sse") ? serverUrl : `${serverUrl}/sse`;
      const transport = new SSEClientTransport(new URL(sseUrl));
      await client.connect(transport);
      
      globalThis.mcpConnected = true;
      console.log("✅ MCP Client Service Connected");
    } catch (error) {
      console.error("❌ Failed to connect to MCP Server:", error);
      throw error;
    } finally {
      globalThis.mcpConnecting = false;
    }
  }

  /**
   * List all available tools from the MCP server.
   */
  async listTools() {
    await this.connect();
    return this.getClient().listTools();
  }

  /**
   * High-level method to predict heart disease risk.
   * Abstraction over the generic callTool method.
   */
  async predictHeartDisease(args: PredictHeartDiseaseArgs): Promise<PredictHeartDiseaseResponse> {
    await this.connect();

    const response = (await this.getClient().callTool({
      name: "predict_heart_disease",
      arguments: args as unknown as Record<string, unknown>,
    })) as { isError: boolean; content: unknown };

    if (response.isError) {
      throw new Error(`MCP Tool Error: ${JSON.stringify(response.content)}`);
    }

    // Narrow down the content type
    const content = response.content as Array<{ type: string; text?: string; [key: string]: unknown }>;
    
    if (!content || content.length === 0) {
      throw new Error("MCP Tool returned empty content");
    }

    const firstContent = content[0];
    if (firstContent.type === "text" && firstContent.text) {
      try {
        return JSON.parse(firstContent.text);
      } catch {
        return firstContent.text as unknown as PredictHeartDiseaseResponse;
      }
    }
    
    return firstContent as unknown as PredictHeartDiseaseResponse;
  }

  /**
   * Generic tool caller for any other tools.
   */
  async callTool(name: string, args?: Record<string, unknown>) {
    await this.connect();
    return this.getClient().callTool({
      name,
      arguments: args,
    });
  }
}

export const mcpClientService = MCPClientService.getInstance();
