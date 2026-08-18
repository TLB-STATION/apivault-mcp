import { describe, it, expect } from "vitest";
import { getApiVaultUrl, getMcpServerUrl, getProtectedResourceMetadata } from "./config";

describe("config", () => {
  it("returns default URLs when env is unset", () => {
    expect(getApiVaultUrl()).toBe("https://api-vault-opal.vercel.app");
    expect(getMcpServerUrl()).toBe("https://apivault-mcp.vercel.app");
  });

  it("generates valid RFC 9728 Protected Resource Metadata", () => {
    const prm = getProtectedResourceMetadata();
    expect(prm.resource).toBe("https://apivault-mcp.vercel.app/mcp");
    expect(prm.authorization_servers).toContain("https://api-vault-opal.vercel.app");
    expect(prm.scopes_supported).toEqual(["keys:read", "keys:write", "keys:reveal"]);
  });
});
