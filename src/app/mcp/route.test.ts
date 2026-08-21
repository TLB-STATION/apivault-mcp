import { describe, it, expect } from "vitest";
import { GET as getMcp, POST as postMcp, DELETE as deleteMcp, OPTIONS as optionsMcp } from "./route";

describe("/mcp route handler", () => {
  it("returns 204 on OPTIONS with CORS headers", async () => {
    const res = await optionsMcp();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Mcp-Protocol-Version");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Last-Event-Id");
    expect(res.headers.get("Access-Control-Expose-Headers")).toContain("Mcp-Protocol-Version");
  });

  it("returns 401 Unauthorized with WWW-Authenticate header when no Bearer token is provided on GET, POST, DELETE", async () => {
    const postReq = new Request("https://mcp.apivault.tech/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });

    const postRes = await postMcp(postReq);
    expect(postRes.status).toBe(401);
    expect(postRes.headers.get("WWW-Authenticate")).toContain('Bearer realm="mcp"');
    expect(postRes.headers.get("WWW-Authenticate")).toContain(".well-known/oauth-protected-resource");
    const body = await postRes.json();
    expect(body.error).toBe("Unauthorized");

    const getReq = new Request("https://mcp.apivault.tech/mcp", { method: "GET" });
    const getRes = await getMcp(getReq);
    expect(getRes.status).toBe(401);

    const delReq = new Request("https://mcp.apivault.tech/mcp", { method: "DELETE" });
    const delRes = await deleteMcp(delReq);
    expect(delRes.status).toBe(401);
  });
});
