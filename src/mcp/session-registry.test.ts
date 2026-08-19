import { describe, it, expect, beforeEach } from "vitest";
import { handleStatefulMcpRequest, __resetMcpSessionsForTests } from "./session-registry";

describe("handleStatefulMcpRequest lifecycle", () => {
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

  it("returns 404 when session id is not found for non-initialize requests", async () => {
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
    expect(body.error.message).toContain("initialize");
  });

  it("allows transparent re-initialization when client sends initialize with a stale session id", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": "stale-session-from-previous-cold-start",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "recovering-client", version: "1.0.0" },
        },
        id: 1,
      }),
    });

    const res = await handleStatefulMcpRequest(req, "user-token");
    // Should succeed (200) instead of failing with 404
    expect(res.status).toBe(200);
    const newSessionId = res.headers.get("mcp-session-id");
    expect(newSessionId).toBeTruthy();
    expect(newSessionId).not.toBe("stale-session-from-previous-cold-start");
  });

  it("completes initialize handshake and manages session across requests", async () => {
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
          clientInfo: { name: "test-client", version: "1.0.0" },
        },
        id: 1,
      }),
    });

    const initRes = await handleStatefulMcpRequest(initReq, "user-token-1");
    expect(initRes.status).toBe(200);
    const sessionId = initRes.headers.get("mcp-session-id");
    expect(sessionId).toBeTruthy();

    // Subsequent tool list request with session ID
    const listReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId!,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 2,
      }),
    });

    const listRes = await handleStatefulMcpRequest(listReq, "user-token-1");
    expect(listRes.status).toBe(200);

    // Reject request with mismatched token
    const mismatchReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId!,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 3,
      }),
    });

    const mismatchRes = await handleStatefulMcpRequest(mismatchReq, "different-token");
    expect(mismatchRes.status).toBe(403);
    const mismatchBody = await mismatchRes.json();
    expect(mismatchBody.error.message).toContain("Session token mismatch");

    // Terminate session with DELETE
    const deleteReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "DELETE",
      headers: {
        "Mcp-Session-Id": sessionId!,
      },
    });

    const deleteRes = await handleStatefulMcpRequest(deleteReq, "user-token-1");
    expect(deleteRes.status).toBeLessThan(400);

    // Subsequent request fails with 404
    const afterDeleteReq = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId!,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/list",
        id: 4,
      }),
    });

    const afterDeleteRes = await handleStatefulMcpRequest(afterDeleteReq, "user-token-1");
    expect(afterDeleteRes.status).toBe(404);
  });
});
