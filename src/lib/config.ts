export const MCP_SCOPES = ["keys:read", "keys:write", "keys:reveal"] as const;
export type McpScope = (typeof MCP_SCOPES)[number];

function normalizeUrl(url: string | undefined, fallback: string): string {
  const raw = (url && url.trim().length > 0 ? url : fallback).trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(raw)) {
    return `https://${raw}`;
  }
  return raw;
}

export function getApiVaultUrl(): string {
  return normalizeUrl(process.env.API_VAULT_URL, "https://api-vault-opal.vercel.app");
}

export function getMcpServerUrl(): string {
  return normalizeUrl(process.env.MCP_SERVER_URL, "https://apivault-mcp.vercel.app");
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
