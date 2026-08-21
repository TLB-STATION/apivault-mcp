import { describe, it, expect } from "vitest";
import { GET as getRoot } from "./route";

describe("Root route /", () => {
  it("redirects to ApiVault MCP documentation with 307 status", async () => {
    const res = await getRoot();
    expect(res.status).toBe(307);
    const expectedApiVault = process.env.API_VAULT_URL ? process.env.API_VAULT_URL.replace(/\/+$/, "") : "https://apivault.tech";
    expect(res.headers.get("location")).toBe(`${expectedApiVault}/docs/mcp`);
  });
});
