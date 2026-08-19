import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMcpServerUrl } from "./config";

export type McpIcon = {
  src: string;
  mimeType: string;
  sizes?: string[];
  theme?: "light" | "dark";
};

function readPublicDataUri(filename: string, mimeType: string): string | null {
  try {
    const buffer = readFileSync(join(process.cwd(), "public", filename));
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Icons for MCP initialize + server card (ImplementationSchema.icons). */
export function getMcpServerIcons(): McpIcon[] {
  const baseUrl = getMcpServerUrl();
  const icons: McpIcon[] = [
    { src: `${baseUrl}/mcp-icon-48.png`, mimeType: "image/png", sizes: ["48x48"] },
    { src: `${baseUrl}/mcp-icon-128.png`, mimeType: "image/png", sizes: ["128x128"] },
    { src: `${baseUrl}/mcp-icon.svg`, mimeType: "image/svg+xml", theme: "light" },
    { src: `${baseUrl}/mcp-icon-dark.svg`, mimeType: "image/svg+xml", theme: "dark" },
  ];

  const png48 = readPublicDataUri("mcp-icon-48.png", "image/png");
  if (png48) {
    icons.push({ src: png48, mimeType: "image/png", sizes: ["48x48"] });
  }

  const png128 = readPublicDataUri("mcp-icon-128.png", "image/png");
  if (png128) {
    icons.push({ src: png128, mimeType: "image/png", sizes: ["128x128"] });
  }

  return icons;
}
