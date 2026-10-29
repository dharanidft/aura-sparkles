import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security";
import { getAuditLogs } from "@/lib/audit-logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, parseInt(searchParams.get("limit") || "100", 10));

  const logs = getAuditLogs(limit);

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs,
  });
}
