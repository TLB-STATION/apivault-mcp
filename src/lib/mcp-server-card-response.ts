import { NextResponse } from "next/server";
import { getMcpServerCard } from "@/lib/mcp-server-card";

const HEADERS = {
  "Content-Type": "application/mcp-server-card+json",
  "Cache-Control": "public, max-age=3600",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-None-Match",
  "Access-Control-Expose-Headers": "ETag",
};

export function mcpServerCardOptionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: HEADERS,
  });
}

export function mcpServerCardResponse() {
  return NextResponse.json(getMcpServerCard(), {
    headers: HEADERS,
  });
}
