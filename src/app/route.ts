import { NextResponse } from "next/server";
import { getApiVaultUrl } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.redirect(`${getApiVaultUrl()}/docs/mcp`, { status: 307 });
}
