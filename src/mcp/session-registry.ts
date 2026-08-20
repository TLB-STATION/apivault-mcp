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
 * Handles incoming MCP requests.
 * - POST: Processes JSON-RPC requests (initialize, tools/list, tools/call) statelessly.
 * - GET: Establishes a standalone SSE stream with immediate priming frame (: connected)
 *   and keep-alive heartbeats to satisfy MCP client stream managers (e.g. Go mcp_manager.go).
 * - DELETE: Acknowledges session teardown.
 */
export async function handleMcpRequest(req: Request, token: string): Promise<Response> {
  if (req.method === "GET") {
    const accept = req.headers.get("accept");
    if (accept && !accept.includes("text/event-stream") && !accept.includes("*/*")) {
      return jsonRpcError(406, "Not Acceptable: Client must accept text/event-stream");
    }

    const encoder = new TextEncoder();
    let keepAliveTimer: NodeJS.Timeout | undefined;

    const stream = new ReadableStream({
      start(controller) {
        // Send immediate priming frame so clients register positive connection progress
        controller.enqueue(encoder.encode(": connected\n\n"));

        // Keep-alive heartbeat every 15 seconds
        keepAliveTimer = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": keepalive\n\n"));
          } catch {
            if (keepAliveTimer) clearInterval(keepAliveTimer);
          }
        }, 15000);
      },
      cancel() {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
      },
    });

    if (req.signal) {
      req.signal.addEventListener("abort", () => {
        if (keepAliveTimer) clearInterval(keepAliveTimer);
      });
    }

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

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

