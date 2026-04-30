import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import dotenv from "dotenv";
import path from "path";
import { PredictHeartDiseaseArgs, PredictHeartDiseaseResponse } from "@/types/index";

// Ensure .env is loaded from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });


class MCPClientService {
  private static instance: MCPClientService;
  private client: Client;
  private connected = false;
  private connecting = false;

  private constructor() {
    this.client = new Client({
      name: "cardioai-mcp-client",
      version: "1.0.0",
    });
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
    if (this.connected) return;
    if (this.connecting) {
      // Wait for existing connection attempt
      while (this.connecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.connecting = true;
    try {
      const serverUrl = process.env.MCP_SERVER_URL || "http://localhost:5000";
      console.log(`🔌 Connecting to MCP Server at ${serverUrl}...`);
      
      const sseUrl = serverUrl.endsWith("/sse") ? serverUrl : `${serverUrl}/sse`;
      const transport = new SSEClientTransport(new URL(sseUrl));
      await this.client.connect(transport);
      
      this.connected = true;
      console.log("✅ MCP Client Service Connected");
    } catch (error) {
      console.error("❌ Failed to connect to MCP Server:", error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  /**
   * List all available tools from the MCP server.
   */
  async listTools() {
    await this.connect();
    return this.client.listTools();
  }

  /**
   * High-level method to predict heart disease risk.
   * Abstraction over the generic callTool method.
   */
  async predictHeartDisease(args: PredictHeartDiseaseArgs): Promise<PredictHeartDiseaseResponse> {
    await this.connect();

    const response = (await this.client.callTool({
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
    return this.client.callTool({
      name,
      arguments: args,
    });
  }
}

export const mcpClientService = MCPClientService.getInstance();
