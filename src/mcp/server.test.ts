import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMcpServer } from "./server";

describe("McpServer tool definitions", () => {
  it("initializes McpServer with name and version", () => {
    const server = createMcpServer("test-token");
    expect(server).toBeDefined();
  });
});
