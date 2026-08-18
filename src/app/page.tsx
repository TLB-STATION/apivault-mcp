import Link from "next/link";
import { getApiVaultUrl, getMcpServerUrl } from "@/lib/config";

export default function Home() {
  const mcpUrl = `${getMcpServerUrl()}/mcp`;
  const apiVaultUrl = getApiVaultUrl();

  const cursorSnippet = JSON.stringify(
    {
      mcpServers: {
        apivault: {
          url: mcpUrl,
        },
      },
    },
    null,
    2,
  );

  return (
    <main style={{ maxWidth: "800px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#10b981",
            boxShadow: "0 0 10px #10b981",
          }}
        />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
          ApiVault Remote MCP Server
        </h1>
      </div>

      <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "2rem" }}>
        Official Model Context Protocol (MCP) server for{" "}
        <a href={apiVaultUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8", textDecoration: "none" }}>
          ApiVault
        </a>
        . Secure, encrypted API key management for AI coding agents (Cursor, Claude Desktop, Windsurf).
      </p>

      <section style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "0.75rem", color: "#f3f4f6" }}>
          Cursor / Claude Desktop Configuration
        </h2>
        <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Add this to your MCP configuration file (e.g. <code>~/.cursor/mcp.json</code> or Claude Desktop settings):
        </p>
        <pre
          style={{
            backgroundColor: "#030712",
            border: "1px solid #374151",
            borderRadius: "8px",
            padding: "1rem",
            color: "#38bdf8",
            fontSize: "0.9rem",
            overflowX: "auto",
            margin: 0,
          }}
        >
          {cursorSnippet}
        </pre>
      </section>

      <section style={{ backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem", color: "#f3f4f6" }}>
          Endpoints & Protocol
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
          <li>
            <strong>Streamable HTTP MCP:</strong> <code>{mcpUrl}</code>
          </li>
          <li>
            <strong>Protected Resource Metadata:</strong>{" "}
            <a href="/.well-known/oauth-protected-resource" style={{ color: "#38bdf8" }}>
              /.well-known/oauth-protected-resource
            </a>
          </li>
          <li>
            <strong>Authorization Server:</strong>{" "}
            <a href={`${apiVaultUrl}/.well-known/oauth-authorization-server`} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>
              {apiVaultUrl}
            </a>
          </li>
          <li>
            <strong>Documentation:</strong>{" "}
            <a href={`${apiVaultUrl}/docs/mcp`} target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>
              {apiVaultUrl}/docs/mcp
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
