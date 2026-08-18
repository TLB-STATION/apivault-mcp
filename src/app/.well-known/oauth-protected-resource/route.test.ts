import { describe, it, expect } from "vitest";
import { GET as getPrm, OPTIONS as optionsPrm } from "./route";

describe("/.well-known/oauth-protected-resource", () => {
  it("returns 204 on OPTIONS with CORS headers", async () => {
    const res = await optionsPrm();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns 200 with RFC 9728 metadata on GET", async () => {
    const res = await getPrm();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.resource).toBe("https://apivault-mcp.vercel.app/mcp");
    expect(body.authorization_servers).toContain("https://api-vault-opal.vercel.app");
    expect(body.scopes_supported).toEqual(["keys:read", "keys:write", "keys:reveal"]);
    expect(body.bearer_methods_supported).toEqual(["header"]);
  });
});
