import { NextResponse } from "next/server";
import { getProtectedResourceMetadata } from "@/lib/config";

const HEADERS = {
  "Cache-Control": "public, max-age=300",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(getProtectedResourceMetadata(), {
    headers: HEADERS,
  });
}
