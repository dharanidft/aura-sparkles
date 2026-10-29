import { NextResponse } from "next/server";
import crypto from "crypto";
import { 
  getAdminPasscode, 
  createAdminSessionToken, 
  ADMIN_COOKIE_NAME 
} from "@/lib/security";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit-logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "Unknown";

  // 1. Rate limiting check (5 attempts per 15 mins)
  const rl = checkRateLimit(`admin-login:${ip}`, "adminLogin");
  if (!rl.allowed) {
    logAdminAction({
      action: "AUTH_ADMIN_LOGIN_RATE_LIMITED",
      adminUser: "Anonymous",
      ip,
      userAgent,
      severity: "WARN",
      details: { resetSeconds: rl.resetSeconds },
    });
    return createRateLimitResponse(
      rl.limit,
      rl.resetSeconds,
      `Too many failed admin login attempts. Account temporarily locked. Please try again in ${Math.ceil(rl.resetSeconds / 60)} minutes.`
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { passcode, username = "Store Admin" } = body;

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json({ error: "Admin passcode is required." }, { status: 400 });
    }

    const expectedPasscode = getAdminPasscode().trim();
    const providedBuffer = Buffer.from(passcode.trim());
    const expectedBuffer = Buffer.from(expectedPasscode);

    const isMatch =
      providedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, expectedBuffer);

    if (!isMatch) {
      logAdminAction({
        action: "AUTH_ADMIN_LOGIN_FAILURE",
        adminUser: username,
        ip,
        userAgent,
        severity: "WARN",
        details: { attemptedUsername: username },
      });
      return NextResponse.json(
        { error: "Invalid admin passcode.", remainingAttempts: rl.remaining },
        { status: 401 }
      );
    }

    // Success: Generate cryptographically signed admin session
    const token = createAdminSessionToken(username);
    const isProd = process.env.NODE_ENV === "production";

    logAdminAction({
      action: "AUTH_ADMIN_LOGIN_SUCCESS",
      adminUser: username,
      ip,
      userAgent,
      severity: "INFO",
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
      role: "admin",
      username,
    });

    // Set secure, HTTP-only cookie
    const secureFlag = isProd ? "; Secure" : "";
    response.headers.set(
      "Set-Cookie",
      `${ADMIN_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secureFlag}`
    );

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error during login." }, { status: 500 });
  }
}
