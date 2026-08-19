import { mcpServerCardOptionsResponse, mcpServerCardResponse } from "@/lib/mcp-server-card-response";

export async function OPTIONS() {
  return mcpServerCardOptionsResponse();
}

export async function GET() {
  return mcpServerCardResponse();
}
