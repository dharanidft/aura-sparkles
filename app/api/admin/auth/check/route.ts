import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = verifyAdminRequest(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { authenticated: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    role: "admin",
    username: auth.username,
  });
}
