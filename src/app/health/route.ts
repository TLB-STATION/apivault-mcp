import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "apivault-mcp",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: HEADERS,
    },
  );
}
