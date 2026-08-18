import { describe, it, expect } from "vitest";
import { getApiVaultUrl, getMcpServerUrl, getProtectedResourceMetadata } from "./config";

describe("config", () => {
  it("returns default URLs when env is unset", () => {
    expect(getApiVaultUrl()).toContain("https://api-vault-opal.vercel.app");
    expect(getMcpServerUrl()).toContain("https://apivault-mcp.vercel.app");
  });

  it("generates valid RFC 9728 Protected Resource Metadata", () => {
    const prm = getProtectedResourceMetadata();
    expect(prm.resource).toBe(`${getMcpServerUrl()}/mcp`);
    expect(prm.authorization_servers).toContain(getApiVaultUrl());
    expect(prm.scopes_supported).toEqual(["keys:read", "keys:write", "keys:reveal"]);
  });
});
