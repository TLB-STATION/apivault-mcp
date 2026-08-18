export const MCP_SCOPES = ["keys:read", "keys:write", "keys:reveal"] as const;
export type McpScope = (typeof MCP_SCOPES)[number];

export function getApiVaultUrl(): string {
  return (process.env.API_VAULT_URL ?? "https://api-vault-opal.vercel.app").replace(/\/+$/, "");
}

export function getMcpServerUrl(): string {
  return (process.env.MCP_SERVER_URL ?? "https://apivault-mcp.vercel.app").replace(/\/+$/, "");
}

export function getProtectedResourceMetadata() {
  const mcpServer = getMcpServerUrl();
  const apiVault = getApiVaultUrl();
  return {
    resource: `${mcpServer}/mcp`,
    authorization_servers: [apiVault],
    scopes_supported: [...MCP_SCOPES],
    bearer_methods_supported: ["header"],
    documentation_uri: `${apiVault}/docs/mcp`,
  };
}
