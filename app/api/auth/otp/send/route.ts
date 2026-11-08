import { NextResponse } from "next/server";
import { 
  normalizePhoneNumber, 
  checkCanRequestOtp, 
  generateOtp, 
  dispatchOtpWhatsApp,
  dispatchOtpSms,
  dispatchOtpEmail
} from "@/lib/otp-service";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phoneNumber, email, countryCode = "+91", channel = "whatsapp" } = body;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Email OTP Dispatch
    // ──────────────────────────────────────────────────────────────────────────
    if (email && typeof email === "string" && EMAIL_REGEX.test(email.trim())) {
      const cleanEmail = email.trim().toLowerCase();

      const check = checkCanRequestOtp(cleanEmail);
      if (!check.allowed) {
        return NextResponse.json(
          { error: check.error || "Rate limit reached. Please wait.", waitSeconds: check.waitSeconds },
          { status: 429 }
        );
      }

      const { otp, expiresAt } = generateOtp(cleanEmail);
      const dispatchResult = await dispatchOtpEmail(cleanEmail, otp);

      if (!dispatchResult.success) {
        return NextResponse.json(
          { 
            error: dispatchResult.error || "Failed to send verification code to email.",
            provider: dispatchResult.provider 
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        channel: "email",
        message: `6-digit verification code sent to ${cleanEmail}`,
        cooldownSeconds: 60,
        expiresAt,
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Mobile Phone Number (WhatsApp / SMS) OTP Dispatch
    // ──────────────────────────────────────────────────────────────────────────
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid mobile number or email address." },
        { status: 400 }
      );
    }

    const clean = phoneNumber.replace(/\D/g, "");
    if (clean.length < 10 || clean.length > 15) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit mobile number." },
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

    // Dispatch via WhatsApp (or SMS fallback)
    let dispatchResult: { success: boolean; provider: string; error?: string };
    if (channel === "sms") {
      dispatchResult = await dispatchOtpSms(normalized, otp);
    } else {
      dispatchResult = await dispatchOtpWhatsApp(normalized, otp);
    }

    if (!dispatchResult.success) {
      return NextResponse.json(
        { 
          error: dispatchResult.error || "Failed to send WhatsApp verification code.",
          provider: dispatchResult.provider 
        },
        { status: 502 }
      );
    }

    const masked = normalized.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, "$1 $2 **** $3");

    return NextResponse.json({
      success: true,
      message: `WhatsApp verification code sent to ${masked}`,
      channel,
      provider: dispatchResult.provider,
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
