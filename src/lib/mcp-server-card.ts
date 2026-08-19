import { getApiVaultUrl, getMcpServerUrl } from "@/lib/config";
import { getMcpServerIcons } from "@/lib/mcp-icons";

/** Required by SEP-2127; not yet published on static.modelcontextprotocol.io (404 today). */
export const MCP_SERVER_CARD_SCHEMA_URL =
  "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json";

export const MCP_SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"] as const;

export function getMcpServerCard() {
  const mcpOrigin = getMcpServerUrl();

  return {
    $schema: MCP_SERVER_CARD_SCHEMA_URL,
    name: "app.apivault/vault",
    title: "ApiVault",
    version: "1.0.0",
    description: "Secure API key vault for AI agents and developers.",
    websiteUrl: getApiVaultUrl(),
    remotes: [
      {
        type: "streamable-http",
        url: `${mcpOrigin}/mcp`,
        supportedProtocolVersions: [...MCP_SUPPORTED_PROTOCOL_VERSIONS],
      },
    ],
    icons: getMcpServerIcons(),
  };
}
