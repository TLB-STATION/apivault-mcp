# ApiVault Remote MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Protocol: MCP](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol-green.svg)](https://modelcontextprotocol.io)
[![Transport: Streamable HTTP](https://img.shields.io/badge/Transport-Streamable%20HTTP-purple.svg)](https://modelcontextprotocol.io/docs/concepts/transports)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) remote server for **[ApiVault](https://api-vault-opal.vercel.app)**.

Connect AI coding agents in **Cursor**, **Claude Desktop**, and **Windsurf** to your encrypted API vault with scoped permissions, browser-based OAuth 2.1 approval, and zero-knowledge encryption support.

---

## ⚡ Features

- **🔐 OAuth 2.1 Scoped Permissions**: Fine-grained authorization (`keys:read`, `keys:write`, `keys:reveal`).
- **🛡️ Zero-Knowledge Compatible**: Custom passphrase-protected vaults are decrypted on-the-fly and never stored on disk.
- **🌐 Remote Streamable HTTP**: Modern HTTP transport eliminating stdio/CLI prerequisites for editor agents.
- **🔒 Zero Database Credentials**: The MCP server operates as a stateless protocol gateway, holding zero database passwords or master encryption keys.
- **⚡ 6 Powerful Tools**:
  - `list_keys`: Browse masked credentials with optional environment and service filtering.
  - `get_key`: Retrieve metadata and masked value for a specific credential.
  - `reveal_key`: Decrypt and reveal the raw secret value on-demand.
  - `add_key`: Store a new credential in the encrypted vault.
  - `update_key`: Update metadata or re-encrypt secret values.
  - `delete_key`: Permanently remove credentials.

---

## 🚀 Quick Start

### 1. Cursor Setup

Add the ApiVault MCP server URL to your Cursor MCP settings or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "apivault": {
      "url": "https://apivault-mcp.vercel.app/mcp"
    }
  }
}
```

When Cursor initiates connection, your browser will open to approve access on ApiVault.

---

### 2. Claude Desktop Setup

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apivault": {
      "url": "https://apivault-mcp.vercel.app/mcp"
    }
  }
}
```

---

## 🛠️ MCP Tools Reference

| Tool | Scope Required | Description |
|---|---|---|
| `list_keys` | `keys:read` | List API keys (masked preview) with optional `environment` and `service` filters. |
| `get_key` | `keys:read` | Retrieve metadata for a single key by `id`. |
| `reveal_key` | `keys:reveal` | Decrypt and return the raw secret value. Supports optional `vault_key` for custom-mode accounts. |
| `add_key` | `keys:write` | Store a new encrypted key (`name`, `key`, `service`, `environment`, `notes`, `vault_key`). |
| `update_key` | `keys:write` | Update key fields or secret values. |
| `delete_key` | `keys:write` | Permanently remove a key by `id`. |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│  AI Agent (Cursor / Claude Desktop)                      │
└────────────────────────────┬─────────────────────────────┘
                             │ Streamable HTTP (JSON-RPC)
                             ▼
┌──────────────────────────────────────────────────────────┐
│  ApiVault MCP Server (apivault-mcp.vercel.app)           │
│  - RFC 9728 Protected Resource Metadata (PRM)           │
│  - Streamable HTTP Transport (/mcp)                      │
│  - Tool Registry & Input Validation                      │
└────────────────────────────┬─────────────────────────────┘
                             │ Scoped HTTPS REST API
                             ▼
┌──────────────────────────────────────────────────────────┐
│  ApiVault Backend (api-vault-opal.vercel.app)            │
│  - OAuth 2.1 Authorization Server (DCR + PKCE S256)      │
│  - Browser Consent UI (/mcp/authorize)                   │
│  - Cryptographic Key Decryption & MySQL Vault            │
└──────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables

For self-hosting or custom deployments:

| Variable | Default | Description |
|---|---|---|
| `API_VAULT_URL` | `https://api-vault-opal.vercel.app` | Base URL of the ApiVault OAuth & Vault backend. |
| `MCP_SERVER_URL` | `https://apivault-mcp.vercel.app` | Public URL where this MCP server is hosted. |

---

## 💻 Local Development & Self-Hosting

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/Mohamed-Eltelb/apivault-mcp.git
cd apivault-mcp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local  # Optional

# 4. Start local development server
npm run dev
# Starts on http://localhost:3001
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security & Privacy

- **No Stored Passphrases**: Custom vault passphrases provided via `vault_key` are used in-memory for cryptographic derivation and are never persisted.
- **Masked by Default**: `list_keys` and `get_key` return masked previews (`sk_live_••••1234`), preventing accidental token leakage into LLM context windows.
- **Revocable Tokens**: Disconnect AI agents anytime via ApiVault's Web UI at **Settings → MCP Connections**.

---

## 📄 License

MIT © [Mohamed Eltelb](https://github.com/Mohamed-Eltelb) & [ApiVault](https://api-vault-opal.vercel.app)
