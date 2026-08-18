import { describe, it, expect } from "vitest";
import { GET as getRoot } from "./route";

describe("Root route /", () => {
  it("redirects to ApiVault MCP documentation with 307 status", async () => {
    const res = await getRoot();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://api-vault-opal.vercel.app/docs/mcp");
  });
});
