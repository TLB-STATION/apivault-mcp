import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApiVault MCP Server",
  description: "Official Model Context Protocol (MCP) server for ApiVault encrypted API key management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#0a0c10", color: "#e2e8f0" }}>
        {children}
      </body>
    </html>
  );
}
