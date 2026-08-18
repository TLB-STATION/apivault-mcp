import { describe, it, expect, beforeEach } from "vitest";
import { handleStatefulMcpRequest, __resetMcpSessionsForTests } from "./session-registry";

describe("handleStatefulMcpRequest", () => {
  beforeEach(() => {
    __resetMcpSessionsForTests();
  });

  it("returns 400 Bad Request when request is missing session id and is not initialize", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });

    const res = await handleStatefulMcpRequest(req, "test-token");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Mcp-Session-Id header is required");
  });

  it("returns 400 on invalid JSON body", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid_json",
    });

    const res = await handleStatefulMcpRequest(req, "test-token");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Parse error: Invalid JSON");
  });

  it("returns 404 when session id is not found", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Mcp-Session-Id": "non-existent-session-id",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });

    const res = await handleStatefulMcpRequest(req, "test-token");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.message).toContain("Session not found");
  });
});
