import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminRequest } from "@/lib/security";
import { logAdminAction } from "@/lib/audit-logger";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const auth = verifyAdminRequest(request);

  if (auth.authorized) {
    logAdminAction({
      action: "AUTH_ADMIN_LOGOUT",
      adminUser: auth.username,
      ip,
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Admin logged out successfully.",
  });

  // Clear cookie
  response.headers.set(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  );

  return response;
}
