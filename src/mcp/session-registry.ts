import { randomUUID } from "node:crypto";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpServer } from "./server";

type McpSessionRecord = {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
  token: string;
  createdAt: number;
  lastUsedAt: number;
};

declare global {
  var __apivaultMcpStandaloneSessions: Map<string, McpSessionRecord> | undefined;
}

const DEFAULT_SESSION_TTL_MINUTES = 60;

function getSessionTtlMs(): number {
  const envMinutes = process.env.MCP_SESSION_TTL_MINUTES;
  if (envMinutes) {
    const parsed = Number(envMinutes);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed * 60 * 1000;
    }
  }
  return DEFAULT_SESSION_TTL_MINUTES * 60 * 1000;
}

function sessionMap(): Map<string, McpSessionRecord> {
  if (!global.__apivaultMcpStandaloneSessions) {
    global.__apivaultMcpStandaloneSessions = new Map();
  }
  return global.__apivaultMcpStandaloneSessions;
}

function jsonRpcError(status: number, message: string): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message },
      id: null,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function pruneExpiredSessions() {
  const now = Date.now();
  const ttl = getSessionTtlMs();
  for (const [sessionId, record] of sessionMap()) {
    if (now - record.lastUsedAt > ttl) {
      void disposeSession(sessionId);
    }
  }
}

async function disposeSession(sessionId: string) {
  const record = sessionMap().get(sessionId);
  if (!record) return;
  sessionMap().delete(sessionId);

  try {
    await record.transport.close();
  } catch {
    // ignore
  }

  try {
    await record.server.close();
  } catch {
    // ignore
  }
}

async function createSession(token: string, req: Request, parsedBody: unknown): Promise<Response> {
  let pendingRecord: McpSessionRecord | null = null;

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: false,
    onsessioninitialized: (sessionId) => {
      if (pendingRecord) {
        sessionMap().set(sessionId, pendingRecord);
      }
    },
    onsessionclosed: (sessionId) => {
      void disposeSession(sessionId);
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      void disposeSession(transport.sessionId);
    }
  };

  const server = createMcpServer(token);
  const now = Date.now();
  pendingRecord = {
    transport,
    server,
    token,
    createdAt: now,
    lastUsedAt: now,
  };

  await server.connect(transport);
  return transport.handleRequest(req, { parsedBody });
}

export async function handleStatefulMcpRequest(req: Request, token: string): Promise<Response> {
  pruneExpiredSessions();

  const sessionId = req.headers.get("mcp-session-id");
  let parsedBody: unknown;

  if (req.method === "POST") {
    try {
      parsedBody = await req.json();
    } catch {
      return jsonRpcError(400, "Parse error: Invalid JSON");
    }
  }

  if (sessionId) {
    const existing = sessionMap().get(sessionId);
    if (!existing) {
      // Session expired or lost (cold start / redeploy / TTL).
      // If the client is re-initializing, allow transparent recovery
      // instead of forcing a hard 404 → manual refresh cycle.
      if (req.method === "POST" && isInitializeRequest(parsedBody)) {
        return createSession(token, req, parsedBody);
      }
      return jsonRpcError(
        404,
        "Session not found. The server may have restarted — please send a new initialize request without a session ID.",
      );
    }
    if (existing.token !== token) {
      return jsonRpcError(403, "Forbidden: Session token mismatch");
    }
    existing.lastUsedAt = Date.now();
    return existing.transport.handleRequest(req, parsedBody !== undefined ? { parsedBody } : undefined);
  }

  if (req.method === "POST" && isInitializeRequest(parsedBody)) {
    return createSession(token, req, parsedBody);
  }

  return jsonRpcError(400, "Bad Request: Mcp-Session-Id header is required");
}

export function __resetMcpSessionsForTests() {
  sessionMap().clear();
}
