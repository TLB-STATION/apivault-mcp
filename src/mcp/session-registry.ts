import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "./server";

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

/**
 * Handles incoming MCP requests statelessly for serverless environments (e.g. Vercel).
 * In stateless mode (sessionIdGenerator: undefined):
 * - No session ID is returned to the client on initialize, preventing client-side
 *   standalone SSE stream errors ("session not found" on multi-worker cold starts).
 * - Every request (initialize, tools/list, tools/call) is executed reliably on any worker.
 * - Inbound standalone GET SSE streams are handled without 404 session failures.
 */
export async function handleMcpRequest(req: Request, token: string): Promise<Response> {
  let parsedBody: unknown;

  if (req.method === "POST") {
    try {
      parsedBody = await req.json();
    } catch {
      return jsonRpcError(400, "Parse error: Invalid JSON");
    }
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: false,
  });

  const server = createMcpServer(token);
  await server.connect(transport);

  return transport.handleRequest(req, parsedBody !== undefined ? { parsedBody } : undefined);
}

/** Backwards-compatible alias for existing imports. */
export const handleStatefulMcpRequest = handleMcpRequest;

export function __resetMcpSessionsForTests() {
  // Stateless mode holds no persistent session state
}

