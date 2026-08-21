import { describe, it, expect } from "vitest";
import { getApiVaultUrl, getMcpServerUrl, getProtectedResourceMetadata } from "./config";

describe("config", () => {
  it("returns default URLs when env is unset", () => {
    const expectedApiVault = process.env.API_VAULT_URL ? process.env.API_VAULT_URL.replace(/\/+$/, "") : "https://apivault.tech";
    const expectedMcp = process.env.MCP_SERVER_URL ? process.env.MCP_SERVER_URL.replace(/\/+$/, "") : "https://mcp.apivault.tech";
    expect(getApiVaultUrl()).toBe(expectedApiVault);
    expect(getMcpServerUrl()).toBe(expectedMcp);
  });

  it("generates valid RFC 9728 Protected Resource Metadata", () => {
    const prm = getProtectedResourceMetadata();
    const expectedApiVault = process.env.API_VAULT_URL ? process.env.API_VAULT_URL.replace(/\/+$/, "") : "https://apivault.tech";
    const expectedMcp = process.env.MCP_SERVER_URL ? process.env.MCP_SERVER_URL.replace(/\/+$/, "") : "https://mcp.apivault.tech";
    expect(prm.resource).toBe(`${expectedMcp}/mcp`);
    expect(prm.authorization_servers).toContain(expectedApiVault);
    expect(prm.bearer_methods_supported).toEqual(["header"]);
    expect(prm.icon_uri).toBe(`${expectedMcp}/mcp-icon-128.png`);
    expect(prm.logo_uri).toBe(`${expectedMcp}/mcp-icon-128.png`);
  });
});
