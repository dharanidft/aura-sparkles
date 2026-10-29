import { NextResponse } from "next/server";
import { 
  checkEmailRateLimit, 
  generateEmailSignInToken, 
  sendEmailSignInMessage 
} from "@/lib/email-auth-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, redirect: returnPath = "/account" } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate limit & cooldown check
    const rateLimit = checkEmailRateLimit(cleanEmail);
    if (!rateLimit.allowed) {
      if (rateLimit.reason === "COOLDOWN") {
        return NextResponse.json(
          { 
            error: `Please wait ${rateLimit.waitSeconds}s before requesting another login link.`,
            waitSeconds: rateLimit.waitSeconds 
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Too many sign-in link requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // Determine application origin
    const host = request.headers.get("host") || "www.aurasparkles.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // Generate secure link token
    const { rawToken, expiresAt } = generateEmailSignInToken(cleanEmail);
    const verifyUrl = `${origin}/auth/verify-link?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(cleanEmail)}&redirect=${encodeURIComponent(returnPath)}`;

    // Dispatch email
    const sendResult = await sendEmailSignInMessage(cleanEmail, verifyUrl);

    const isLocalhost = host.includes("localhost") || origin.includes("localhost");

    return NextResponse.json({
      success: true,
      emailSent: sendResult.success,
      warning: !sendResult.success ? sendResult.error : undefined,
      devLink: process.env.NODE_ENV !== "production" && (!sendResult.success || isLocalhost) ? verifyUrl : undefined,
      message: sendResult.success 
        ? "Check your email for your secure login link."
        : "Sign-in link created. (Email delivery waiting for Firebase keys or GoDaddy SMTP password)",
      cooldownSeconds: 60,
      expiresAt,
    });
  } catch (err: any) {
    console.error("[Email Auth Send Link] Error:", err);
    return NextResponse.json(
      { error: "Failed to dispatch sign-in link. Please try again." },
      { status: 500 }
    );
  }
}
