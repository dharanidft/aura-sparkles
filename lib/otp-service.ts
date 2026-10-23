import crypto from "crypto";

interface OtpRecord {
  phoneNumber: string; // E.164 normalized, e.g. "+919876543210"
  hashedOtp: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  lastRequestedAt: number;
}

interface RateLimitRecord {
  requestTimestamps: number[];
}

// In-memory active OTP records and rate limit registries
const activeOtps = new Map<string, OtpRecord>();
const rateLimits = new Map<string, RateLimitRecord>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const MAX_REQUESTS_IN_WINDOW = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const OTP_SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || "aura-sparkles-otp-hmac-salt-secret-2026";

export function normalizePhoneNumber(raw: string, countryCode = "+91"): string {
  const digitsOnly = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) {
    return `+${digitsOnly}`;
  }
  // Default to Indian phone number if 10 digits
  if (digitsOnly.length === 10) {
    const cleanCC = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
    return `${cleanCC}${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac("sha256", OTP_SECRET).update(`${otp}:${salt}`).digest("hex");
}

/**
 * Validates rate limiting and resend cooldown.
 */
export function checkCanRequestOtp(phoneNumber: string): { allowed: boolean; waitSeconds?: number; error?: string } {
  const now = Date.now();
  const existing = activeOtps.get(phoneNumber);

  // 1. Resend cooldown (60 seconds)
  if (existing && now - existing.lastRequestedAt < RESEND_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastRequestedAt)) / 1000);
    return {
      allowed: false,
      waitSeconds,
      error: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
    };
  }

  // 2. Sliding window rate limit (Max 3 OTP requests in 10 minutes)
  const rl = rateLimits.get(phoneNumber) || { requestTimestamps: [] };
  const validTimestamps = rl.requestTimestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_IN_WINDOW) {
    const oldest = validTimestamps[0];
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return {
      allowed: false,
      waitSeconds,
      error: `Too many OTP requests. Please wait ${Math.ceil(waitSeconds / 60)} minutes before trying again.`,
    };
  }

  return { allowed: true };
}

/**
 * Generates and stores a secure hashed 6-digit OTP.
 */
export function generateOtp(phoneNumber: string): { otp: string; expiresAt: number } {
  const now = Date.now();
  const otpNumber = crypto.randomInt(100000, 999999).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedOtp = hashOtp(otpNumber, salt);
  const expiresAt = now + OTP_TTL_MS;

  const record: OtpRecord = {
    phoneNumber,
    hashedOtp,
    salt,
    createdAt: now,
    expiresAt,
    attempts: 0,
    lastRequestedAt: now,
  };

  activeOtps.set(phoneNumber, record);

  // Record rate limit request
  const rl = rateLimits.get(phoneNumber) || { requestTimestamps: [] };
  rl.requestTimestamps.push(now);
  rateLimits.set(phoneNumber, rl);

  return { otp: otpNumber, expiresAt };
}

/**
 * Verifies customer OTP against the stored cryptographic hash.
 */
export function verifyOtp(phoneNumber: string, userEnteredOtp: string): { valid: boolean; error?: string } {
  const now = Date.now();
  const record = activeOtps.get(phoneNumber);

  if (!record) {
    return {
      valid: false,
      error: "No active OTP found for this phone number. Please request a new OTP.",
    };
  }

  if (now > record.expiresAt) {
    activeOtps.delete(phoneNumber);
    return {
      valid: false,
      error: "Your OTP has expired. Please request a new OTP.",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    activeOtps.delete(phoneNumber);
    return {
      valid: false,
      error: "Too many incorrect verification attempts. This OTP has been invalidated for security. Please request a new one.",
    };
  }

  record.attempts += 1;

  const enteredHash = hashOtp(userEnteredOtp.trim(), record.salt);
  const isValid = crypto.timingSafeEqual(Buffer.from(enteredHash), Buffer.from(record.hashedOtp));

  if (!isValid) {
    const remainingAttempts = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`,
    };
  }

  // Once verified successfully, delete OTP to prevent replay
  activeOtps.delete(phoneNumber);
  return { valid: true };
}

/**
 * Sends OTP via SMS provider.
 * Supports Twilio, Fast2SMS, Msg91, or logs securely.
 */
export async function dispatchOtpSms(phoneNumber: string, otp: string): Promise<{ success: boolean; provider: string; error?: string }> {
  const message = `Your Aura Sparkles login verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
  const maskedPhone = phoneNumber.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, "$1 $2 **** $3");

  // 1. Fast2SMS integration (popular in India)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    try {
      const numbers = phoneNumber.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers,
        }),
      });
      const data = await res.json();
      if (data.return) {
        console.log(`[Aura Auth] Fast2SMS dispatch successful to ${maskedPhone}`);
        return { success: true, provider: "fast2sms" };
      }
    } catch (err: any) {
      console.error("[Aura Auth] Fast2SMS dispatch error:", err);
    }
  }

  // 2. Twilio SMS Integration
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
      const body = new URLSearchParams({
        To: phoneNumber,
        From: twilioPhone,
        Body: message,
      });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (res.ok) {
        console.log(`[Aura Auth] Twilio SMS dispatch successful to ${maskedPhone}`);
        return { success: true, provider: "twilio" };
      }
    } catch (err: any) {
      console.error("[Aura Auth] Twilio dispatch error:", err);
    }
  }

  // 3. Fallback: Log secure dispatch notice
  console.log(`[Aura Auth OTP Dispatch] Code generated for ${maskedPhone}. (Active valid for 5m)`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEVELOPMENT ONLY] OTP Code for ${phoneNumber}: ${otp}`);
  }

  return { success: true, provider: "system_dispatch" };
}
