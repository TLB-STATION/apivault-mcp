import { describe, it, expect } from "vitest";
import { GET as getMcp, POST as postMcp, OPTIONS as optionsMcp } from "./route";

describe("/mcp route handler", () => {
  it("returns 204 on OPTIONS with CORS headers", async () => {
    const res = await optionsMcp();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
  });

  it("returns 401 Unauthorized with WWW-Authenticate header when no Bearer token is provided", async () => {
    const req = new Request("https://apivault-mcp.vercel.app/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });

    const res = await postMcp(req);
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toContain('Bearer realm="mcp"');
    expect(res.headers.get("WWW-Authenticate")).toContain(".well-known/oauth-protected-resource");
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});
