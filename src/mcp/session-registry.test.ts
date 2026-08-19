import { describe, it, expect } from "vitest";
import { handleMcpRequest, handleStatefulMcpRequest } from "./session-registry";

describe("handleMcpRequest stateless lifecycle", () => {
  it("completes initialize request and does NOT issue a session ID (stateless mode)", async () => {
    const initReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "stateless-client", version: "1.0.0" },
        },
        id: 1,
      }),
    });

    const initRes = await handleMcpRequest(initReq, "test-token");
    expect(initRes.status).toBe(200);
    // In stateless mode, no Mcp-Session-Id is issued, preventing clients from attempting standalone SSE stream
    expect(initRes.headers.get("mcp-session-id")).toBeNull();
  });

  it("handles tools/list statelessly without requiring an Mcp-Session-Id header", async () => {
    const listReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 2,
      }),
    });

    const listRes = await handleMcpRequest(listReq, "test-token");
    expect(listRes.status).toBe(200);
  });

  it("handles requests gracefully even if client includes a legacy Mcp-Session-Id header", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": "legacy-or-stale-session-id-12345",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 3,
      }),
    });

    const res = await handleMcpRequest(req, "test-token");
    expect(res.status).toBe(200);
  });

  it("returns 400 on invalid JSON body", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid_json",
    });

    const res = await handleMcpRequest(req, "test-token");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Parse error: Invalid JSON");
  });

  it("handles GET SSE connection requests without returning 404 session not found", async () => {
    const getReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "GET",
      headers: {
        "Accept": "text/event-stream",
      },
    });

    const getRes = await handleMcpRequest(getReq, "test-token");
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get("Content-Type")).toContain("text/event-stream");
  });

  it("aliases handleStatefulMcpRequest for backwards compatibility", () => {
    expect(handleStatefulMcpRequest).toBe(handleMcpRequest);
  });
});

