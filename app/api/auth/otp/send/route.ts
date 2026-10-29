import { NextResponse } from "next/server";
import { 
  normalizePhoneNumber, 
  checkCanRequestOtp, 
  generateOtp, 
  dispatchOtpWhatsApp,
  dispatchOtpSms 
} from "@/lib/otp-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phoneNumber, countryCode = "+91", channel = "whatsapp" } = body;

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Mobile number is required." }, { status: 400 });
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
    let dispatchResult: { success: boolean; provider: string; error?: string; devOtp?: string };
    if (channel === "sms") {
      dispatchResult = await dispatchOtpSms(normalized, otp);
    } else {
      dispatchResult = await dispatchOtpWhatsApp(normalized, otp);
    }

    if (!dispatchResult.success) {
      return NextResponse.json(
        { error: dispatchResult.error || "Failed to dispatch WhatsApp verification code. Please try again." },
        { status: 500 }
      );
    }

    const masked = normalized.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, "$1 $2 **** $3");
    const host = request.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

    return NextResponse.json({
      success: true,
      message: `WhatsApp verification code sent to ${masked}`,
      channel,
      provider: dispatchResult.provider,
      devOtp: isLocalhost || process.env.NODE_ENV !== "production" ? (dispatchResult.devOtp || otp) : undefined,
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
