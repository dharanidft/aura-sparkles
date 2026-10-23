import { NextResponse } from "next/server";
import { 
  normalizePhoneNumber, 
  checkCanRequestOtp, 
  generateOtp, 
  dispatchOtpSms 
} from "@/lib/otp-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phoneNumber, countryCode = "+91" } = body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
    }

    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length < 10 || clean.length > 15) {
      return NextResponse.json(
        { error: "Please provide a valid mobile number (10 digits for India)." },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phoneNumber, countryCode);

    // Rate limit check
    const check = checkCanRequestOtp(normalized);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.error || "Rate limit reached. Please wait.", waitSeconds: check.waitSeconds },
        { status: 429 }
      );
    }

    // Generate cryptographic OTP
    const { otp, expiresAt } = generateOtp(normalized);

    // Send SMS
    const dispatchResult = await dispatchOtpSms(normalized, otp);
    if (!dispatchResult.success) {
      return NextResponse.json(
        { error: "Failed to dispatch SMS verification. Please try again." },
        { status: 500 }
      );
    }

    const masked = normalized.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, "$1 $2 **** $3");

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${masked}`,
      cooldownSeconds: 60,
      expiresAt,
    });
  } catch (err: any) {
    console.error("[Aura Auth] Send OTP error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred while sending OTP." },
      { status: 500 }
    );
  }
}
