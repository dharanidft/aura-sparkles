import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit-logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`verify-pay:${ip}`, { maxRequests: 10, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return createRateLimitResponse(rl.limit, rl.resetSeconds);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isProd = process.env.NODE_ENV === "production";

    // 1. Production or Secret-Configured Gateway: Signature verification is strictly MANDATORY
    if (secret && secret !== "YourRazorpaySecretHere") {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        logAdminAction({
          action: "SECURITY_PAYMENT_VERIFICATION_TAMPER",
          adminUser: "System",
          ip,
          severity: "WARN",
          details: { error: "Missing required payment signature fields" },
        });
        return NextResponse.json(
          { verified: false, error: "Payment verification failed. Missing transaction signature." },
          { status: 400 }
        );
      }

      // Timing-safe HMAC SHA-256 verification
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const expectedBuf = Buffer.from(expectedSignature);
      const providedBuf = Buffer.from(razorpay_signature);

      const isValid =
        expectedBuf.length === providedBuf.length &&
        crypto.timingSafeEqual(expectedBuf, providedBuf);

      if (!isValid) {
        logAdminAction({
          action: "SECURITY_PAYMENT_SIGNATURE_INVALID",
          adminUser: "System",
          ip,
          severity: "CRITICAL",
          details: { razorpay_order_id, razorpay_payment_id },
        });
        return NextResponse.json(
          { verified: false, error: "Payment verification failed. Invalid transaction signature." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        verified: true,
        paymentId: razorpay_payment_id,
        message: "Payment successfully verified via Razorpay gateway.",
      });
    }

    // 2. Production with missing gateway secret is a configuration error
    if (isProd) {
      logAdminAction({
        action: "SECURITY_GATEWAY_CONFIG_ERROR",
        adminUser: "System",
        ip,
        severity: "CRITICAL",
        details: { error: "RAZORPAY_KEY_SECRET is missing in production" },
      });
      return NextResponse.json(
        { verified: false, error: "Payment gateway is not properly configured." },
        { status: 500 }
      );
    }

    // 3. Local Development Demo Fallback (Non-production only)
    console.warn(`[Aura Security] Test mode payment verification for ${razorpay_order_id} (allowed only in development)`);
    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id || `test_pay_${Date.now()}`,
      message: "Test transaction verified in local development mode.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { verified: false, error: error.message || "Payment verification error." },
      { status: 500 }
    );
  }
}
