import crypto from "crypto";
import nodemailer from "nodemailer";

interface EmailLinkRecord {
  email: string;
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

interface RateLimitRecord {
  requestTimestamps: number[];
}

// In-memory records
const activeEmailLinks = new Map<string, EmailLinkRecord>();
const emailRateLimits = new Map<string, RateLimitRecord>();

const LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getEmailSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSCODE || "aura-sparkles-email-auth-secret-key-2026";
}

export function checkEmailRateLimit(email: string): { allowed: boolean; waitSeconds?: number; reason?: string } {
  const now = Date.now();
  const cleanEmail = email.trim().toLowerCase();
  const rl = emailRateLimits.get(cleanEmail);

  if (!rl) {
    return { allowed: true };
  }

  // Filter out timestamps outside the window
  rl.requestTimestamps = rl.requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  // Check 60s cooldown from last request
  const lastRequest = rl.requestTimestamps[rl.requestTimestamps.length - 1];
  if (lastRequest && now - lastRequest < COOLDOWN_MS) {
    const waitSeconds = Math.ceil((COOLDOWN_MS - (now - lastRequest)) / 1000);
    return {
      allowed: false,
      waitSeconds,
      reason: "COOLDOWN",
    };
  }

  // Check max requests
  if (rl.requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = rl.requestTimestamps[0];
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return {
      allowed: false,
      waitSeconds,
      reason: "RATE_LIMITED",
    };
  }

  return { allowed: true };
}

/**
 * Generates a cryptographic sign-in link token for the given email
 */
export function generateEmailSignInToken(email: string): { rawToken: string; expiresAt: number } {
  const cleanEmail = email.trim().toLowerCase();
  const now = Date.now();
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const expiresAt = now + LINK_EXPIRY_MS;

  const rawToken = `${randomBytes}_${now}_${expiresAt}`;
  const tokenHash = crypto.createHmac("sha256", getEmailSecret()).update(rawToken).digest("hex");

  activeEmailLinks.set(cleanEmail, {
    email: cleanEmail,
    tokenHash,
    createdAt: now,
    expiresAt,
    used: false,
  });

  // Track rate limiting
  const rl = emailRateLimits.get(cleanEmail) || { requestTimestamps: [] };
  rl.requestTimestamps.push(now);
  emailRateLimits.set(cleanEmail, rl);

  return { rawToken, expiresAt };
}

/**
 * Validates a server-generated email sign-in link token
 */
export function verifyEmailSignInToken(email: string, rawToken: string): { valid: boolean; error?: string } {
  if (!email || !rawToken) {
    return { valid: false, error: "Missing email address or sign-in token." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const record = activeEmailLinks.get(cleanEmail);

  if (!record) {
    return { valid: false, error: "No active sign-in link found. Please request a new link." };
  }

  if (record.used) {
    return { valid: false, error: "This sign-in link has already been used. Please request a new link." };
  }

  if (Date.now() > record.expiresAt) {
    activeEmailLinks.delete(cleanEmail);
    return { valid: false, error: "This sign-in link has expired. Links remain valid for 15 minutes." };
  }

  const expectedHash = crypto.createHmac("sha256", getEmailSecret()).update(rawToken).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(record.tokenHash), Buffer.from(expectedHash))) {
    return { valid: false, error: "Invalid sign-in link. Please request a fresh link." };
  }

  // Mark token as consumed
  record.used = true;
  activeEmailLinks.delete(cleanEmail);

  return { valid: true };
}

/**
 * Dispatches the sign-in link via GoDaddy SMTP or logs for development
 */
export async function sendEmailSignInMessage(
  email: string,
  signInUrl: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  const smtpHost = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const smtpUser = process.env.SMTP_USER || "contact@aurasparkles.com";
  const smtpPass = process.env.SMTP_PASS;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"Aura Sparkles" <${smtpUser}>`,
        to: cleanEmail,
        subject: "Your Secure Sign-In Link — Aura Sparkles",
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 580px; margin: 0 auto; background-color: #FAF7F2; padding: 32px 24px; border-radius: 20px; border: 1px solid #EAE0D5;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #452638; letter-spacing: 0.18em; font-size: 24px; text-transform: uppercase; margin: 0;">AURA SPARKLES</h1>
              <p style="color: #B69A62; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; margin-top: 4px;">Pure · Elegant · You</p>
            </div>

            <div style="background-color: #ffffff; padding: 28px; border-radius: 16px; border: 1px solid #EAE0D5; text-align: center;">
              <h2 style="color: #452638; font-size: 20px; margin-top: 0;">Your Secure Sign-In Link</h2>
              <p style="color: #766E65; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                Click the gold button below to securely sign in to your Aura Sparkles account. No password or numeric OTP is required.
              </p>

              <a href="${signInUrl}" style="display: inline-block; background-color: #452638; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(69, 38, 56, 0.2);">
                Sign In to Aura Sparkles
              </a>

              <p style="color: #A89F91; font-size: 11px; margin-top: 24px; line-height: 1.5;">
                This link is valid for 15 minutes. If you did not request this link, you can safely ignore this email.
              </p>
            </div>

            <p style="color: #A89F91; font-size: 10px; text-align: center; margin-top: 24px;">
              © ${new Date().getFullYear()} Aura Sparkles · Handcrafted Luxury Scented Candles
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Aura Auth] Sign-in link email dispatched via SMTP to ${cleanEmail}`);
      return { success: true };
    } catch (err: any) {
      console.error("[Aura Auth] SMTP dispatch failed:", err.message);
    }
  }

  // Development Fallback Logging
  console.log(`[Aura Email Link Auth] Link generated for ${cleanEmail}: ${signInUrl}`);
  return { success: true };
}
