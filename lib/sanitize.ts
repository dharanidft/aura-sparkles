import crypto from "crypto";

const CAPTCHA_SECRET = process.env.SESSION_SECRET || "aura-sparkles-captcha-secret-2026";

/**
 * Escapes HTML characters to prevent XSS (Cross-Site Scripting) and HTML Injection.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips dangerous control characters and trims text.
 */
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") return "";
  // Strip NULL bytes and control characters (except newline, tab, carriage return)
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Validates and normalizes email addresses.
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleaned) || cleaned.length > 254) {
    return null;
  }
  return cleaned;
}

/**
 * Normalizes and validates Indian phone numbers (+91).
 */
export function sanitizePhone(phone: unknown): string | null {
  if (typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

/**
 * Strictly sanitizes filenames to prevent Path Traversal attacks (../ or ..\\).
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") return "file";
  // Strip path separators, null bytes, and parent references
  const basename = filename.replace(/^.*[\\\/]/, "").replace(/\0/g, "");
  const safe = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Limit length and prevent hidden/empty files
  return safe.slice(0, 100) || "file";
}

/**
 * Honeypot bot protection: checks that the hidden decoy field is empty.
 * Returns true if valid human, false if bot triggered the trap.
 */
export function verifyHoneypot(formData: Record<string, any>, honeypotFieldName: string = "_website_hp"): boolean {
  const hpValue = formData[honeypotFieldName];
  return !hpValue || hpValue.toString().trim().length === 0;
}

/**
 * Generates a signed anti-bot challenge for public forms.
 * Requires solving a simple question with a 10-minute expiry token.
 */
export function generateCaptchaChallenge(): { token: string; question: string } {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const answer = (num1 + num2).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const payload = `${answer}:${expiresAt}`;
  const sig = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${sig}`).toString("base64url");

  return {
    token,
    question: `Security Check: What is ${num1} + ${num2}?`,
  };
}

/**
 * Verifies a submitted anti-bot challenge response.
 */
export function verifyCaptchaResponse(token: string, userAnswer: string): { valid: boolean; error?: string } {
  if (!token || !userAnswer) {
    return { valid: false, error: "Security check is required." };
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [expectedAnswer, expiresAtStr, sig] = decoded.split(":");
    if (!expectedAnswer || !expiresAtStr || !sig) {
      return { valid: false, error: "Invalid security token format." };
    }

    const payload = `${expectedAnswer}:${expiresAtStr}`;
    const expectedSig = crypto.createHmac("sha256", CAPTCHA_SECRET).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false, error: "Security token verification failed." };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      return { valid: false, error: "Security check expired. Please try again." };
    }

    if (userAnswer.trim() !== expectedAnswer) {
      return { valid: false, error: "Incorrect security answer. Please solve the question correctly." };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Could not verify security check." };
  }
}
