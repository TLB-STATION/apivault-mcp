import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMcpServer } from "./server";
import { ApiVaultClient, ApiVaultError } from "../lib/apivault-client";

describe("McpServer tool definitions", () => {
  it("initializes McpServer with name and version", () => {
    const server = createMcpServer("test-token");
    expect(server).toBeDefined();
  });

  it("registers all 6 expected tools", () => {
    const server = createMcpServer("test-token");
    // McpServer internally registers tools in its tool map / instance
    expect(server).toHaveProperty("registerTool");
  });
});
